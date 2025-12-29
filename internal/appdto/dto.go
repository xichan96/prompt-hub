package appdto

import "github.com/xichan96/prompt-hub/pkg/ec"

type CreateIDResponse struct {
	*ec.ErrorCode
	Data map[string]string `json:"data,omitempty"`
}

type UserListResponse struct {
	*ec.ErrorCode
	Data []User `json:"data,omitempty"`
}

type NamespaceListResponse struct {
	*ec.ErrorCode
	Data []Namespace `json:"data,omitempty"`
}

type PromptResponse struct {
	*ec.ErrorCode
	Data Prompt `json:"data,omitempty"`
}

type PromptListResponse struct {
	*ec.ErrorCode
	Data []Prompt `json:"data,omitempty"`
}

type SettingResponse struct {
	*ec.ErrorCode
	Data Setting `json:"data,omitempty"`
}

type SettingListResponse struct {
	*ec.ErrorCode
	Data []Setting `json:"data,omitempty"`
}

type EmptyResponse struct {
	*ec.ErrorCode
}
