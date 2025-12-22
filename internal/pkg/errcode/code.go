package errcode

import "github.com/xichan96/prompt-hub/pkg/ec"

var baseErr = ec.NewErrorCode(1000, "base error")
var ErrCodeInvalid = ec.NewErrorCode(1001, "invalid code")
var ErrAdminNotFound = ec.NewErrorCode(1002, "admin not found")
var ErrCodeSend = ec.NewErrorCode(1003, "code send failed")
