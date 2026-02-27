# Frontend Testing Setup Complete ✅

Your dev environment is ready:
- **Anvil**: Running on http://127.0.0.1:8545
- **Frontend**: Running on http://localhost:3001
- **Factory Contract**: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

---

## Step 1: Add Anvil Network to MetaMask

1. Open **MetaMask**
2. Click **Networks dropdown** (top left)
3. Click **Add Network**
4. Fill in these details:

```
Network name: Anvil Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH
```

5. Click **Save**

---

## Step 2: Import Test Account

1. In MetaMask, click **Account icon** (top right circle)
2. Click **Import Account**
3. Select **Private Key** method
4. Paste this test account private key:

```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

5. Click **Import**
6. Rename it to "Anvil Test Account" (optional)

**This account has 10,000 ETH for testing** ✨

---

## Step 3: Test the Frontend

1. **Open** http://localhost:3001
2. **Connect Wallet** button (top right)
3. **Select MetaMask**
4. Make sure **Anvil Local network** is selected in MetaMask
5. **Approve connection** in MetaMask popup

---

## Step 4: Deploy a Test Token

1. Fill in token details:
   - **Name**: `My Test Token`
   - **Symbol**: `MTT`
   - **Total Supply**: `1000000` (1 million)
   - Other fields keep defaults

2. Click **Deploy Token**
3. **Approve transaction** in MetaMask
4. Wait for confirmation (~5 seconds on Anvil)
5. ✅ Token deployed! View address in confirmation

---

## What Happens

When you deploy through the frontend:
1. Frontend calls factory contract with your settings
2. Factory creates new Token + LiquidityController
3. 20% of tokens go to liquidity pool (MockRouter)
4. 60% locked for progressive unlocks
5. 20% available immediately

All using **free test ETH** from Anvil! 🎉

---

## Troubleshooting

**"Can't connect to wallet"**
- Make sure MetaMask is on "Anvil Local" network
- Make sure you imported the test account

**"Transaction rejected"**
- Check MetaMask is showing correct network
- Make sure account has ETH (should show as 10,000)

**"Network error"**
- Check Anvil is running: should see process in terminal
- If not, run: `anvil --port 8545`

**"Contract address is 0x0"**
- Wait a few seconds and refresh browser
- Anvil is instant but frontend may need rerender

---

## Next Steps After Testing

1. **Test Token Transfers**: Use token contract address to check balances
2. **Test Unlock Mechanism**: Run `cast` commands from TESTING_GUIDE.md
3. **Multiple Deployments**: Deploy as many test tokens as you want
4. **Check Balances**: Each deployment has different contract addresses

---

## Quick Reference

| Item | Value |
|------|-------|
| Frontend | http://localhost:3001 |
| Anvil RPC | http://127.0.0.1:8545 |
| Chain ID | 31337 |
| Factory | 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 |
| Test Account | 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 |
| Test ETH Available | 10,000 ETH |

---

**Ready? Open http://localhost:3001 and click "Connect Wallet"!** 🚀
