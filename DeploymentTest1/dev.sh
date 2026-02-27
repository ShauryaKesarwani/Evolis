#!/bin/bash

# Token Factory - Development Helper Script

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

function print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

function print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

function print_error() {
    echo -e "${RED}✗ $1${NC}"
}

function print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check prerequisites
function check_prereqs() {
    print_header "Checking Prerequisites"
    
    # Check Foundry
    if command -v forge &> /dev/null; then
        print_success "Foundry installed ($(forge --version | head -n1))"
    else
        print_error "Foundry not installed"
        echo "Install with: curl -L https://foundry.paradigm.xyz | bash"
        exit 1
    fi
    
    # Check Node
    if command -v node &> /dev/null; then
        print_success "Node.js installed ($(node --version))"
    else
        print_error "Node.js not installed"
        echo "Download from: https://nodejs.org/"
        exit 1
    fi
    
    echo ""
}

# Build contracts
function build_contracts() {
    print_header "Building Smart Contracts"
    cd Contracts
    forge build
    if [ $? -eq 0 ]; then
        print_success "Contracts built successfully"
    else
        print_error "Contract build failed"
        exit 1
    fi
    cd ..
    echo ""
}

# Run tests
function run_tests() {
    print_header "Running Tests"
    cd Contracts
    forge test -vv
    if [ $? -eq 0 ]; then
        print_success "All tests passed"
    else
        print_error "Some tests failed"
        exit 1
    fi
    cd ..
    echo ""
}

# Deploy factory
function deploy_factory() {
    print_header "Deploying Factory Contract"
    
    if [ -z "$1" ]; then
        print_error "Please specify network: testnet or mainnet"
        echo "Usage: ./dev.sh deploy [testnet|mainnet]"
        exit 1
    fi
    
    NETWORK=$1
    cd Contracts
    
    if [ "$NETWORK" == "testnet" ]; then
        print_info "Deploying to BSC Testnet..."
        forge script script/DeployFactory.s.sol:DeployFactory \
            --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545/ \
            --broadcast \
            --verify
    elif [ "$NETWORK" == "mainnet" ]; then
        print_info "Deploying to BSC Mainnet..."
        read -p "Are you sure? This will use real BNB! (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            print_info "Deployment cancelled"
            exit 0
        fi
        forge script script/DeployFactory.s.sol:DeployFactory \
            --rpc-url https://bsc-dataseed.binance.org/ \
            --broadcast \
            --verify
    else
        print_error "Invalid network. Use 'testnet' or 'mainnet'"
        exit 1
    fi
    
    cd ..
    echo ""
}

# Start frontend
function start_frontend() {
    print_header "Starting Frontend"
    cd Frontend
    
    if [ ! -d "node_modules" ]; then
        print_info "Installing dependencies..."
        npm install
    fi
    
    if [ ! -f ".env.local" ]; then
        print_error ".env.local not found"
        print_info "Creating from .env.example..."
        cp .env.example .env.local
        echo ""
        print_info "Please edit Frontend/.env.local with your configuration"
        exit 1
    fi
    
    print_success "Starting development server..."
    npm run dev
}

# Clean build artifacts
function clean() {
    print_header "Cleaning Build Artifacts"
    
    print_info "Cleaning contracts..."
    cd Contracts
    forge clean
    rm -rf cache out
    cd ..
    
    print_info "Cleaning frontend..."
    cd Frontend
    rm -rf .next node_modules
    cd ..
    
    print_success "Clean complete"
    echo ""
}

# Show help
function show_help() {
    echo "Token Factory Development Helper"
    echo ""
    echo "Usage: ./dev.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  check        Check prerequisites"
    echo "  build        Build smart contracts"
    echo "  test         Run contract tests"
    echo "  deploy       Deploy factory [testnet|mainnet]"
    echo "  frontend     Start frontend dev server"
    echo "  clean        Clean build artifacts"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh check"
    echo "  ./dev.sh build"
    echo "  ./dev.sh test"
    echo "  ./dev.sh deploy testnet"
    echo "  ./dev.sh frontend"
    echo ""
}

# Main script
case "$1" in
    check)
        check_prereqs
        ;;
    build)
        build_contracts
        ;;
    test)
        run_tests
        ;;
    deploy)
        deploy_factory $2
        ;;
    frontend)
        start_frontend
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
