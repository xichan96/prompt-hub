FROM FROM golang:1.24.4

ENV GO111MODULE auto
COPY . /go/src/app

WORKDIR /go/src/app

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -mod=vendor  ./cmd/app/main.go

FROM alpine:3.17.10
RUN apk add -U tzdata ca-certificates
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime
COPY --from=0 /go/src/app/main /go/bin/main

CMD /go/bin/main