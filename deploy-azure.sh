#!/bin/bash

# Liquid Sort Game - Azure Container Apps Deployment Script

# Configuration
RESOURCE_GROUP="poland-second-rg"
CONTAINER_APP="liquid-sort-game-capp"
ENVIRONMENT="ls-game-env"
REGISTRY_NAME="liquidsortregistry"
IMAGE_NAME="liquid-sort-game"
TAG="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🎮 Liquid Sort Game - Azure Deployment${NC}"
echo -e "${CYAN}=======================================${NC}"
echo -e "${YELLOW}Resource Group: ${RESOURCE_GROUP}${NC}"
echo -e "${YELLOW}Container App: ${CONTAINER_APP}${NC}"
echo -e "${YELLOW}Registry: ${REGISTRY_NAME}${NC}"
echo ""

# Step 1: Check Azure CLI login
echo -e "${BLUE}🔐 Checking Azure CLI authentication...${NC}"
if ! az account show > /dev/null 2>&1; then
    echo -e "${RED}❌ Please login to Azure first: az login${NC}"
    exit 1
fi
ACCOUNT=$(az account show --query "name" -o tsv)
echo -e "${GREEN}✅ Logged in to Azure account: ${ACCOUNT}${NC}"

# Step 2: Build the Docker image locally
echo -e "${BLUE}🔨 Building Docker image...${NC}"
LOCAL_IMAGE_TAG="${IMAGE_NAME}:${TAG}"
if ! docker build -t "${LOCAL_IMAGE_TAG}" .; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker image built successfully: ${LOCAL_IMAGE_TAG}${NC}"

# Step 3: Login to Azure Container Registry
echo -e "${BLUE}🔑 Logging into Azure Container Registry...${NC}"
if ! az acr login --name "${REGISTRY_NAME}"; then
    echo -e "${RED}❌ ACR login failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Successfully logged into ACR: ${REGISTRY_NAME}${NC}"

# Step 4: Tag and push image to ACR
echo -e "${BLUE}📦 Tagging and pushing image to ACR...${NC}"
ACR_IMAGE_TAG="${REGISTRY_NAME}.azurecr.io/${IMAGE_NAME}:${TAG}"
docker tag "${LOCAL_IMAGE_TAG}" "${ACR_IMAGE_TAG}"
if ! docker push "${ACR_IMAGE_TAG}"; then
    echo -e "${RED}❌ Docker push failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Image pushed successfully: ${ACR_IMAGE_TAG}${NC}"

# Step 5: Update Container App with new image
echo -e "${BLUE}🚀 Updating Container App...${NC}"
if ! az containerapp update \
    --name "${CONTAINER_APP}" \
    --resource-group "${RESOURCE_GROUP}" \
    --image "${ACR_IMAGE_TAG}" \
    --set-env-vars "NGINX_HOST=0.0.0.0" "NGINX_PORT=80"; then
    echo -e "${RED}❌ Container App update failed${NC}"
    exit 1
fi

# Step 6: Get the app URL
echo -e "${BLUE}🌐 Getting application URL...${NC}"
APP_URL=$(az containerapp show --name "${CONTAINER_APP}" --resource-group "${RESOURCE_GROUP}" --query "properties.configuration.ingress.fqdn" -o tsv)

if [ -n "${APP_URL}" ]; then
    echo ""
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo ""
    echo -e "${CYAN}🌐 Your Liquid Sort Game is now available at:${NC}"
    echo -e "   https://${APP_URL}"
    echo ""
    echo -e "${CYAN}📊 Container App details:${NC}"
    az containerapp show --name "${CONTAINER_APP}" --resource-group "${RESOURCE_GROUP}" --query "{name:name,url:properties.configuration.ingress.fqdn,state:properties.runningStatus}" -o table
else
    echo -e "${YELLOW}⚠️  Deployment completed but couldn't retrieve app URL${NC}"
    echo -e "${YELLOW}   Check Azure portal for the Container App URL${NC}"
fi

echo ""
echo -e "${CYAN}📝 Useful commands:${NC}"
echo -e "   View logs: az containerapp logs show --name ${CONTAINER_APP} --resource-group ${RESOURCE_GROUP} --follow"
echo -e "   View revisions: az containerapp revision list --name ${CONTAINER_APP} --resource-group ${RESOURCE_GROUP} -o table"
echo -e "   Scale app: az containerapp update --name ${CONTAINER_APP} --resource-group ${RESOURCE_GROUP} --min-replicas 1 --max-replicas 3"
