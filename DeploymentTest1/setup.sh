#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Token Factory Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -d "Contracts" ] || [ ! -d "Frontend" ]; then
    echo -e "${YELLOW}Error: Please run this script from the DeploymentTest1 directory${NC}"
    exit 1
fi

# Setup Contracts
echo -e "${GREEN}Setting up Foundry contracts...${NC}"
cd Contracts

# Check if Foundry is installed
if ! command -v forge &> /dev/null; then
    echo -e "${YELLOW}Foundry not found. Installing...${NC}"
    curl -L https://foundry.paradigm.xyz | bash
    foundryup
fi

# Install dependencies
echo "Installing OpenZeppelin contracts..."
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Setup environment file
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}Please edit Contracts/.env and add your PRIVATE_KEY${NC}"
fi

# Build contracts
echo "Building contracts..."
forge build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Contracts built successfully${NC}"
else
    echo -e "${YELLOW}✗ Contract build failed${NC}"
    exit 1
fi

# Run tests
echo "Running tests..."
forge test

cd ..

# Setup Frontend
echo ""
echo -e "${GREEN}Setting up Next.js frontend...${NC}"
cd Frontend

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Install dependencies
echo "Installing npm packages..."
npm install

# Setup environment file
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cp .env.example .env.local
    echo -e "${YELLOW}Please edit Frontend/.env.local and add:${NC}"
    echo "  - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"
    echo "  - NEXT_PUBLIC_FACTORY_ADDRESS (after deploying)"
fi

cd ..

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Deploy Factory contract:"
echo -e "   ${BLUE}cd Contracts${NC}"
echo -e "   ${BLUE}forge script script/DeployFactory.s.sol:DeployFactory --rpc-url \$BSC_TESTNET_RPC --broadcast${NC}"
echo ""
echo "2. Update frontend config with factory address:"
echo -e "   ${BLUE}Edit Frontend/.env.local${NC}"
echo ""
echo "3. Start frontend development server:"
echo -e "   ${BLUE}cd Frontend${NC}"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo -e "Visit ${BLUE}http://localhost:3000${NC} to deploy tokens!"
echo ""
