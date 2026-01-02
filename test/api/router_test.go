package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"testing"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/config"
	"github.com/xichan96/prompt-hub/internal/di"
	"github.com/xichan96/prompt-hub/internal/infra/migrate"
	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/internal/infra/persist"
	"github.com/xichan96/prompt-hub/pkg/ec"
	"github.com/xichan96/prompt-hub/pkg/web/jwt"
	"golang.org/x/crypto/bcrypt"
)

func init() {
	config.InitConfig()
	if err := migrate.EnsureDatabase(); err != nil {
		panic(err)
	}
	config.InitVariable()
	migrate.MigrateTable()
	initAdminUser()
}

func initAdminUser() {
	ctx := context.Background()
	up := persist.NewUserPersist()

	_, err := up.GetBy(ctx, up.Where(
		up.F().Username.Eq("admin"),
		up.F().Role.Eq("admin"),
	))

	if err != nil && ec.IsErrCode(err, ec.NoFound) {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
		if err != nil {
			panic(err)
		}
		_, err = up.Create(ctx, &model.User{
			Username: "admin",
			Password: string(hashedPassword),
			Role:     "admin",
		})
		if err != nil {
			panic(err)
		}
	} else if err != nil {
		panic(err)
	}
}

func getServerURL() string {
	url := os.Getenv("TEST_SERVER_URL")
	if url == "" {
		url = "http://localhost:8088"
	}
	return url
}

func generateToken(userID, username, role string) string {
	token, _ := jwt.DefaultToken.Encode(map[string]interface{}{
		"id":       userID,
		"username": username,
		"role":     role,
	})
	return token
}

func getAdminToken() string {
	ctx := context.Background()
	req := &appdto.LoginRequest{
		Username: "admin",
		Password: "admin",
	}
	resp, err := di.UserApp.LoginWithPassword(ctx, req)
	if err != nil {
		panic(err)
	}
	return resp.Token
}

func sendRequest(method, url string, headers map[string]string, body interface{}) (*http.Response, error) {
	var bodyReader io.Reader
	if body != nil {
		bodyBytes, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewBuffer(bodyBytes)
	}

	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		return nil, err
	}

	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	for k, v := range headers {
		req.Header.Set(k, v)
	}

	client := &http.Client{}
	return client.Do(req)
}

func createNamespace(baseURL, token string) (string, error) {
	resp, err := sendRequest("POST", baseURL+"/api/namespaces", map[string]string{"X-JWT": token}, map[string]interface{}{"name": "test-namespace"})
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("failed to create namespace: status %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	var result struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}
	return result.Data.ID, nil
}

func createPrompt(baseURL, token, namespaceID string) (string, error) {
	resp, err := sendRequest("POST", baseURL+"/api/namespaces/"+namespaceID+"/prompts", map[string]string{"X-JWT": token}, map[string]interface{}{"name": "test-prompt"})
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("failed to create prompt: status %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	var result struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}
	return result.Data.ID, nil
}

func TestLoginAPI(t *testing.T) {
	baseURL := getServerURL()

	tests := []struct {
		name           string
		method         string
		path           string
		body           interface{}
		expectedStatus int
	}{
		{
			name:           "valid login",
			method:         "POST",
			path:           "/api/login",
			body:           map[string]interface{}{"username": "admin", "password": "admin"},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "invalid body",
			method:         "POST",
			path:           "/api/login",
			body:           "invalid",
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, nil, tt.body)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}

func TestCreateUserAPI(t *testing.T) {
	baseURL := getServerURL()
	adminToken := getAdminToken()
	if adminToken == "" {
		t.Fatal("failed to get admin token")
	}

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		body           interface{}
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "POST",
			path:           "/api/users",
			headers:        map[string]string{},
			body:           map[string]interface{}{"username": "test", "password": "test"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "forbidden",
			method:         "POST",
			path:           "/api/users",
			headers:        map[string]string{"X-JWT": generateToken("user1", "user", "user")},
			body:           map[string]interface{}{"username": "test", "password": "test"},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "valid request",
			method:         "POST",
			path:           "/api/users",
			headers:        map[string]string{"X-JWT": adminToken},
			body:           map[string]interface{}{"username": "test", "password": "test"},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, tt.body)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				bodyBytes, _ := io.ReadAll(resp.Body)
				t.Errorf("expected status %d, got %d, body: %s", tt.expectedStatus, resp.StatusCode, string(bodyBytes))
			}
		})
	}
}

func TestGetUsersAPI(t *testing.T) {
	baseURL := getServerURL()
	adminToken := getAdminToken()

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "GET",
			path:           "/api/users",
			headers:        map[string]string{},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "forbidden",
			method:         "GET",
			path:           "/api/users",
			headers:        map[string]string{"X-JWT": generateToken("user1", "user", "user")},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "valid request",
			method:         "GET",
			path:           "/api/users",
			headers:        map[string]string{"X-JWT": adminToken},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, nil)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}

func TestUpdateUserAPI(t *testing.T) {
	baseURL := getServerURL()
	userToken := generateToken("user1", "user", "user")

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		body           interface{}
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "PUT",
			path:           "/api/users/user123",
			headers:        map[string]string{},
			body:           map[string]interface{}{"username": "newuser"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "valid request",
			method:         "PUT",
			path:           "/api/users/user123",
			headers:        map[string]string{"X-JWT": userToken},
			body:           map[string]interface{}{"username": "newuser"},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, tt.body)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}

func TestDeleteUserAPI(t *testing.T) {
	baseURL := getServerURL()
	adminToken := getAdminToken()

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "DELETE",
			path:           "/api/users/user123",
			headers:        map[string]string{},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "forbidden",
			method:         "DELETE",
			path:           "/api/users/user123",
			headers:        map[string]string{"X-JWT": generateToken("user1", "user", "user")},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "valid request",
			method:         "DELETE",
			path:           "/api/users/user123",
			headers:        map[string]string{"X-JWT": adminToken},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, nil)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}

func TestCreateNamespaceAPI(t *testing.T) {
	baseURL := getServerURL()
	userToken := generateToken("user1", "user", "user")

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		body           interface{}
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "POST",
			path:           "/api/namespaces",
			headers:        map[string]string{},
			body:           map[string]interface{}{"name": "test"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "valid request",
			method:         "POST",
			path:           "/api/namespaces",
			headers:        map[string]string{"X-JWT": userToken},
			body:           map[string]interface{}{"name": "test"},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, tt.body)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}

func TestGetNamespacesAPI(t *testing.T) {
	baseURL := getServerURL()
	userToken := generateToken("user1", "user", "user")

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "GET",
			path:           "/api/namespaces",
			headers:        map[string]string{},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "valid request",
			method:         "GET",
			path:           "/api/namespaces",
			headers:        map[string]string{"X-JWT": userToken},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, nil)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}

func TestUpdateNamespaceAPI(t *testing.T) {
	baseURL := getServerURL()
	userToken := generateToken("user1", "user", "user")

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		body           interface{}
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "PUT",
			path:           "/api/namespaces/ns123",
			headers:        map[string]string{},
			body:           map[string]interface{}{"name": "newname"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "valid request",
			method:         "PUT",
			path:           "/api/namespaces/ns123",
			headers:        map[string]string{"X-JWT": userToken},
			body:           map[string]interface{}{"name": "newname"},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, tt.body)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}

func TestDeleteNamespaceAPI(t *testing.T) {
	baseURL := getServerURL()
	userToken := generateToken("user1", "user", "user")

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "DELETE",
			path:           "/api/namespaces/ns123",
			headers:        map[string]string{},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "valid request",
			method:         "DELETE",
			path:           "/api/namespaces/ns123",
			headers:        map[string]string{"X-JWT": userToken},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, nil)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}

func TestCreatePromptAPI(t *testing.T) {
	baseURL := getServerURL()
	userToken := generateToken("user1", "user", "user")
	namespaceID, err := createNamespace(baseURL, userToken)
	if err != nil {
		t.Fatalf("failed to create namespace: %v", err)
	}

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		body           interface{}
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "POST",
			path:           fmt.Sprintf("/api/namespaces/%s/prompts", namespaceID),
			headers:        map[string]string{},
			body:           map[string]interface{}{"name": "test"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "valid request",
			method:         "POST",
			path:           fmt.Sprintf("/api/namespaces/%s/prompts", namespaceID),
			headers:        map[string]string{"X-JWT": userToken},
			body:           map[string]interface{}{"name": "test-prompt"},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, tt.body)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				bodyBytes, _ := io.ReadAll(resp.Body)
				t.Errorf("expected status %d, got %d, body: %s", tt.expectedStatus, resp.StatusCode, string(bodyBytes))
			}
		})
	}
}

func TestGetPromptListAPI(t *testing.T) {
	baseURL := getServerURL()
	userToken := generateToken("user1", "user", "user")
	namespaceID, err := createNamespace(baseURL, userToken)
	if err != nil {
		t.Fatalf("failed to create namespace: %v", err)
	}

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "GET",
			path:           fmt.Sprintf("/api/namespaces/%s/prompts", namespaceID),
			headers:        map[string]string{},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "valid request",
			method:         "GET",
			path:           fmt.Sprintf("/api/namespaces/%s/prompts", namespaceID),
			headers:        map[string]string{"X-JWT": userToken},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, nil)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				bodyBytes, _ := io.ReadAll(resp.Body)
				t.Errorf("expected status %d, got %d, body: %s", tt.expectedStatus, resp.StatusCode, string(bodyBytes))
			}
		})
	}
}

func TestUpdatePromptAPI(t *testing.T) {
	baseURL := getServerURL()
	userToken := generateToken("user1", "user", "user")
	namespaceID, err := createNamespace(baseURL, userToken)
	if err != nil {
		t.Fatalf("failed to create namespace: %v", err)
	}
	promptID, err := createPrompt(baseURL, userToken, namespaceID)
	if err != nil {
		t.Fatalf("failed to create prompt: %v", err)
	}

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		body           interface{}
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "PUT",
			path:           fmt.Sprintf("/api/namespaces/%s/prompts/%s", namespaceID, promptID),
			headers:        map[string]string{},
			body:           map[string]interface{}{"name": "newname"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "valid request",
			method:         "PUT",
			path:           fmt.Sprintf("/api/namespaces/%s/prompts/%s", namespaceID, promptID),
			headers:        map[string]string{"X-JWT": userToken},
			body:           map[string]interface{}{"name": "newname"},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, tt.body)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				bodyBytes, _ := io.ReadAll(resp.Body)
				t.Errorf("expected status %d, got %d, body: %s", tt.expectedStatus, resp.StatusCode, string(bodyBytes))
			}
		})
	}
}

func TestPublishPromptAPI(t *testing.T) {
	baseURL := getServerURL()
	userToken := generateToken("user1", "user", "user")
	namespaceID, err := createNamespace(baseURL, userToken)
	if err != nil {
		t.Fatalf("failed to create namespace: %v", err)
	}
	promptID, err := createPrompt(baseURL, userToken, namespaceID)
	if err != nil {
		t.Fatalf("failed to create prompt: %v", err)
	}

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "POST",
			path:           fmt.Sprintf("/api/namespaces/%s/prompts/%s/publish", namespaceID, promptID),
			headers:        map[string]string{},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "valid request",
			method:         "POST",
			path:           fmt.Sprintf("/api/namespaces/%s/prompts/%s/publish", namespaceID, promptID),
			headers:        map[string]string{"X-JWT": userToken},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, nil)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				bodyBytes, _ := io.ReadAll(resp.Body)
				t.Errorf("expected status %d, got %d, body: %s", tt.expectedStatus, resp.StatusCode, string(bodyBytes))
			}
		})
	}
}

func TestDeletePromptAPI(t *testing.T) {
	baseURL := getServerURL()
	userToken := generateToken("user1", "user", "user")
	namespaceID, err := createNamespace(baseURL, userToken)
	if err != nil {
		t.Fatalf("failed to create namespace: %v", err)
	}
	promptID, err := createPrompt(baseURL, userToken, namespaceID)
	if err != nil {
		t.Fatalf("failed to create prompt: %v", err)
	}

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "DELETE",
			path:           fmt.Sprintf("/api/namespaces/%s/prompts/%s", namespaceID, promptID),
			headers:        map[string]string{},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "valid request",
			method:         "DELETE",
			path:           fmt.Sprintf("/api/namespaces/%s/prompts/%s", namespaceID, promptID),
			headers:        map[string]string{"X-JWT": userToken},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, nil)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				bodyBytes, _ := io.ReadAll(resp.Body)
				t.Errorf("expected status %d, got %d, body: %s", tt.expectedStatus, resp.StatusCode, string(bodyBytes))
			}
		})
	}
}

func TestGetPromptAPI(t *testing.T) {
	baseURL := getServerURL()
	userToken := generateToken("user1", "user", "user")
	namespaceID, err := createNamespace(baseURL, userToken)
	if err != nil {
		t.Fatalf("failed to create namespace: %v", err)
	}
	promptID, err := createPrompt(baseURL, userToken, namespaceID)
	if err != nil {
		t.Fatalf("failed to create prompt: %v", err)
	}

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "GET",
			path:           fmt.Sprintf("/api/namespaces/%s/prompts/%s", namespaceID, promptID),
			headers:        map[string]string{},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "valid request",
			method:         "GET",
			path:           fmt.Sprintf("/api/namespaces/%s/prompts/%s", namespaceID, promptID),
			headers:        map[string]string{"X-JWT": userToken},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, nil)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				bodyBytes, _ := io.ReadAll(resp.Body)
				t.Errorf("expected status %d, got %d, body: %s", tt.expectedStatus, resp.StatusCode, string(bodyBytes))
			}
		})
	}
}

func TestCreateSettingAPI(t *testing.T) {
	baseURL := getServerURL()
	adminToken := getAdminToken()

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		body           interface{}
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "POST",
			path:           "/api/settings",
			headers:        map[string]string{},
			body:           map[string]interface{}{"key": "test", "value": "test"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "forbidden",
			method:         "POST",
			path:           "/api/settings",
			headers:        map[string]string{"X-JWT": generateToken("user1", "user", "user")},
			body:           map[string]interface{}{"key": "test", "value": "test"},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "valid request",
			method:         "POST",
			path:           "/api/settings",
			headers:        map[string]string{"X-JWT": adminToken},
			body:           map[string]interface{}{"key": "test", "value": "test"},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, tt.body)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}

func TestGetSettingsAPI(t *testing.T) {
	baseURL := getServerURL()
	adminToken := getAdminToken()

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "GET",
			path:           "/api/settings",
			headers:        map[string]string{},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "forbidden",
			method:         "GET",
			path:           "/api/settings",
			headers:        map[string]string{"X-JWT": generateToken("user1", "user", "user")},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "valid request",
			method:         "GET",
			path:           "/api/settings",
			headers:        map[string]string{"X-JWT": adminToken},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, nil)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}

func TestGetSettingAPI(t *testing.T) {
	baseURL := getServerURL()
	adminToken := getAdminToken()

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		body           interface{}
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "POST",
			path:           "/api/settings/get",
			headers:        map[string]string{},
			body:           map[string]interface{}{"key": "test"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "forbidden",
			method:         "POST",
			path:           "/api/settings/get",
			headers:        map[string]string{"X-JWT": generateToken("user1", "user", "user")},
			body:           map[string]interface{}{"key": "test"},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "valid request",
			method:         "POST",
			path:           "/api/settings/get",
			headers:        map[string]string{"X-JWT": adminToken},
			body:           map[string]interface{}{"key": "test"},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, tt.body)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}

func TestUpdateSettingAPI(t *testing.T) {
	baseURL := getServerURL()
	adminToken := getAdminToken()

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		body           interface{}
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "PUT",
			path:           "/api/settings",
			headers:        map[string]string{},
			body:           map[string]interface{}{"key": "test", "value": "newvalue"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "forbidden",
			method:         "PUT",
			path:           "/api/settings",
			headers:        map[string]string{"X-JWT": generateToken("user1", "user", "user")},
			body:           map[string]interface{}{"key": "test", "value": "newvalue"},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "valid request",
			method:         "PUT",
			path:           "/api/settings",
			headers:        map[string]string{"X-JWT": adminToken},
			body:           map[string]interface{}{"key": "test", "value": "newvalue"},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, tt.body)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}

func TestDeleteSettingAPI(t *testing.T) {
	baseURL := getServerURL()
	adminToken := getAdminToken()

	tests := []struct {
		name           string
		method         string
		path           string
		headers        map[string]string
		body           interface{}
		expectedStatus int
	}{
		{
			name:           "unauthorized",
			method:         "DELETE",
			path:           "/api/settings",
			headers:        map[string]string{},
			body:           map[string]interface{}{"key": "test"},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "forbidden",
			method:         "DELETE",
			path:           "/api/settings",
			headers:        map[string]string{"X-JWT": generateToken("user1", "user", "user")},
			body:           map[string]interface{}{"key": "test"},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "valid request",
			method:         "DELETE",
			path:           "/api/settings",
			headers:        map[string]string{"X-JWT": adminToken},
			body:           map[string]interface{}{"key": "test"},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := sendRequest(tt.method, baseURL+tt.path, tt.headers, tt.body)
			if err != nil {
				t.Fatalf("failed to send request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}
