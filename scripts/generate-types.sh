#!/bin/bash

# Swagger OpenAPI 스펙 URL
# 일반적으로 Spring Boot는 /v3/api-docs 경로에 OpenAPI JSON을 제공합니다
SWAGGER_URL="http://15.165.115.135:8080/v3/api-docs"
DOMAIN_URL="https://api.b2st.doncrytt.online/v3/api-docs"

# 타입 출력 경로
OUTPUT_PATH="types/api.d.ts"

echo "Swagger 타입 생성 중..."

# IP 주소로 시도
if curl -f -s "$SWAGGER_URL" > /dev/null 2>&1; then
    echo "IP 주소로 타입 생성 중..."
    npx openapi-typescript "$SWAGGER_URL" -o "$OUTPUT_PATH"
elif curl -f -s "$DOMAIN_URL" > /dev/null 2>&1; then
    echo "도메인으로 타입 생성 중..."
    npx openapi-typescript "$DOMAIN_URL" -o "$OUTPUT_PATH"
else
    echo "Swagger API를 찾을 수 없습니다. URL을 확인해주세요."
    echo "시도한 URL:"
    echo "  - $SWAGGER_URL"
    echo "  - $DOMAIN_URL"
    exit 1
fi

echo "타입 생성 완료: $OUTPUT_PATH"

