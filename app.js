document.addEventListener('DOMContentLoaded', function() {
    // Contract details
    const contractAddress = "0x1c6b14bf16f0fe15868052903b95775d6cf4bdfa";
    const contractABI = [{
		"inputs": [],
		"name": "donate",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "donor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Donated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Withdrawn",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "contractBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "donationHistory",
		"outputs": [
			{
				"internalType": "address",
				"name": "donor",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "donations",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllDonations",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "donor",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct Donation.DonationDetail[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalDonations",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}];

    // Get DOM elements for popup
    const donateBtn = document.getElementById('donateBtn');
    const popupOverlay = document.getElementById('popupOverlay');
    const closeBtn = document.getElementById('closeBtn');
    
    // Open popup when donate button is clicked
    donateBtn.addEventListener('click', function() {
        popupOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
    
    // Close popup when X button is clicked
    closeBtn.addEventListener('click', function() {
        popupOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Close popup when clicking outside the content
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            popupOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Wallet connection and donation functionality
    let provider;
    let signer;
    let contract;

    async function connectWallet() {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                if (accounts.length === 0) {
                    throw new Error("No accounts found");
                }

                provider = new ethers.BrowserProvider(window.ethereum);
                signer = await provider.getSigner();
                
                const address = await signer.getAddress();
                document.getElementById('connectButton').innerText = 'Connected';
                document.getElementById("walletAddress").innerText = `Wallet Address: ${address.slice(0, 6)}...${address.slice(-4)}`;
                
                contract = new ethers.Contract(contractAddress, contractABI, signer);
                
                loadDonationHistory();
            } catch (error) {
                console.error("Wallet connection failed:", error);
                alert(`Wallet connection failed: ${error.message}`);
            }
        } else {
            alert("MetaMask not detected! Please install MetaMask.");
        }
    }

    // Donate Function
    async function donate(event) {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            alert("Please enter a valid donation amount.");
            return;
        }

        try {
            const tx = await contract.donate({
                value: ethers.parseEther(amount)
            });
            await tx.wait();

            alert("Thank you for your donation!");
            document.getElementById("amount").value = "";
            loadDonationHistory();
        } catch (error) {
            console.error("Donation failed:", error);
            alert("Donation failed. Check console for details.");

			
        }
    }

    // Load Donation History
    async function loadDonationHistory() {
        try {
            const donations = await contract.getAllDonations();
            const historyDiv = document.getElementById("donationHistory");
            historyDiv.innerHTML = "";

            donations.forEach((donation) => {
                const div = document.createElement("div");
                div.className = "history-item";
                div.innerHTML = `
                    <strong>Donor:</strong> ${donation.donor}<br>
                    <strong>Amount:</strong> ${ethers.formatEther(donation.amount)} ETH<br>
                    <strong>Time:</strong> ${new Date(Number(donation.timestamp) * 1000).toLocaleString()}
                `;
                historyDiv.appendChild(div);
            });
        } catch (error) {
            console.error("Failed to load donation history:", error);
        }
    }

    // Event listeners
    document.getElementById("connectButton").addEventListener("click", connectWallet);
    document.getElementById("donationForm").addEventListener("submit", donate);
    
    // Initialize wallet connection if already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
        connectWallet();
    }
});