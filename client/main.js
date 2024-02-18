import {ethers} from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.8.1/ethers.min.js";























// _________________________ Adjust these two parameters __________________
const Ethereum_network = "goerli";
const RPC_HTTP_URL = "https://goerli.infura.io/v3/fa41e27497384dc4877bc930cd66ab0f";
// ________________________________________________________________________





















let provider = new ethers.InfuraProvider(Ethereum_network,RPC_HTTP_URL);
let signer= null;
let accounts = [];
let stakerContract = null;
let stakerContractAddress = "";
let stakerAbi = [

    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address to, uint256 value) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 value) returns (bool)",
    "function transferFrom(address from, address to, uint256 value) returns (bool)",
    "function mint(address account, uint256 value) returns (bool)",
    "function burn(uint256 value) returns (bool)",
    "function getOwner() view returns (address)",
    "function transferOwnership(address newOwner)",
    "function destroyOwnership()",
    "function supportsInterface(bytes4 interfaceId) view returns (bool)",
    "function stakedAmount(address staker) view returns(uint256)",
    "function tokenStakedBy(uint256 tokenId) view returns(address)",
    "function stakedtime(address staker) view returns(uint256)",
    "function unclaimedRewards(address staker) view returns(uint256)",
    "function getRewardRate() view returns(uint256)",
    "function setRewardRate(uint256 newRate)",
    "function stake(uint256 tokenId)",
    "function unstake(uint256 tokenId)",
    "function claim(address receiver)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"

];


let nftContract = null;
let nftContractAddress = "";
let nftAbi = [

    "function balanceOf(address owner) view returns(uint256)",
    "function ownerOf(uint256 tokenId) view returns(address)",
    "function name() view returns(string)",
    "function symbol() view returns(string)",
    "function tokenURI(uint256 tokenId) view returns(string)",
    "function setBaseURI(string newURI)",
    "function approve(address to, uint256 tokenId)",
    "function getApproved(uint256 tokenId) view returns(address)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns(bool)",
    "function transferFrom(address from, address to, uint256 tokenId)",
    "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
    "function mint(address to, uint256 tokenId)",
    "function burn(uint256 tokenId)",
    "function getOwner() view returns (address)",
    "function transferOwnership(address newOwner)",
    "function destroyOwnership()",
    "function supportsInterface(bytes4 interfaceId) view returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"

];

let accountsHaveChanged = async function(){
    signer =  await provider.getSigner();
    console.log("Accounts changed")
    nftContractcontract = new ethers.Contract(nftContractAddress,nftAbi,signer);
    stakerContract = new ethers.Contract(stakerContractAddress,stakerAbi,signer);
};

let networkHasChanged = async function(){
    signer = null;
    document.querySelector("#connect_metamask").style.display = "block";
    document.querySelector("header span").innerText = "";
    document.querySelector("header span").style.display = "none";
    nftContract=null;
    stakerContract=null;
    document.querySelector("#choosing_section").style.display = "none";
    document.querySelector("#interact_with_nft_contract").style.display = "none";
    console.log("The network has changed")
    
}

window.ethereum.on("accountsChanged",accountsHaveChanged);

window.ethereum.on("chainChanged",networkHasChanged)


document.getElementById("connect_metamask").addEventListener("click",async(e)=>{
    // console.log("clicked")
    if(window.ethereum.isMetaMask){
        try{
            provider = new ethers.BrowserProvider(window.ethereum);
            signer =  await provider.getSigner();
            accounts = await provider.send("eth_requestAccounts", [])
        }catch(error){
            if(error.code === 4001){
                console.log("User denied connection attempt")
            }else{
                console.log(error);
            }
        }
    }else{
        console.log("Unable to detect Metamask");
    }

    if(accounts.length > 0){
        document.querySelector("#connect_metamask").style.display = "none";
        document.querySelector("header span").innerText = accounts[0];
        document.querySelector("header span").style.display = "inline";
    }
});

document.getElementById("Contractaddressform").addEventListener("submit",async(event)=>{
    event.preventDefault();
    if(!signer){
        document.querySelector("#connect_metamask").style.border = "5px solid red";
        console.log("Connect Metamask to proceed");
        return;
    }
    nftContractAddress = event.target[0].value;
    stakerContractAddress = event.target[1].value;
    let bytecode1;
    let bytecode2; 
    try{
        bytecode1 = await provider.getCode(nftContractAddress);
        bytecode2 = await provider.getCode(stakerContractAddress);
        
        if(bytecode1 !== "0x"){
            nftContract = new ethers.Contract(nftContractAddress,nftAbi,signer);
            
            console.log("nftcontract found")
        } else{
            console.log("NFTContract not found, make sure you are using the right Network (e.g. mainnet,sepolia,goerli)")
        }

        if(bytecode2 !== "0x"){
            stakerContract = new ethers.Contract(stakerContractAddress,stakerAbi,signer);
            
            console.log('stakercontract found')
        } else{
            console.log("StakingContract not found, make sure you are using the right Network (e.g. mainnet,sepolia,goerli)")
        }

        if(bytecode1 != "0x" && bytecode2 != "0x"){
            document.querySelector("#address_input_section").style.display = "none"
            document.querySelector("#choosing_section").style.display = "block"
        }

    }catch(error){
        console.error("The following error occured",error)
    }
})


document.querySelector("#choosing_section button:first-of-type").addEventListener("click",()=>{
    document.querySelector("#address_input_section").style.display = "none"
    document.querySelector("#interact_with_staking_contract").style.display = "none"
    document.querySelector("#interact_with_nft_contract").style.display = "block"
})

document.querySelector("#choosing_section button:last-of-type").addEventListener("click",()=>{
    document.querySelector("#address_input_section").style.display = "none"
    document.querySelector("#interact_with_staking_contract").style.display = "block"
    document.querySelector("#interact_with_nft_contract").style.display = "none"
})

// event listeners for smart contract interactions

// NFT Contract

// name and symbol of the nft collection
document.querySelector("#interact_with_nft_contract .col-6:first-of-type form").addEventListener("submit",async(event)=>{
    event.preventDefault()

    document.querySelector("#interact_with_nft_contract .col-6:first-of-type span:first-of-type").innerText = "";
    document.querySelector("#interact_with_nft_contract .col-6:first-of-type span:last-of-type").innerText = "";
    let name = await nftContract.name();
    let symbol = await nftContract.symbol();

    

    if(name.length>0 && symbol.length>0){
        document.querySelector("#interact_with_nft_contract .col-6:first-of-type span:first-of-type").innerText = name;
        document.querySelector("#interact_with_nft_contract .col-6:first-of-type span:last-of-type").innerText = symbol;

    }else{
        console.log("unable to read name and symbol, assure Metamask is connected and you provided the correct contract addresses")
    }
})

// owner of an NFT tokenId
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(2) form").addEventListener("submit",async(event)=>{
    event.preventDefault()
    let tokenId = event.target[0].value;
    let owner ;
    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(2) span:first-of-type").innerText = "";
    
    try{
        owner = await nftContract.ownerOf(tokenId);
        
    }catch(error){
        console.log("Unable to fetch the owner, make sure the NFT exists")
        owner =  "Unable to fetch owner";
    }
    
    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(2) span:first-of-type").innerText = owner;
})

// balance of an address
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(3) form").addEventListener("submit",async(event)=>{
    event.preventDefault()
    let address = event.target[0].value;
    let balance;

    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(3) span:first-of-type").innerText = "";
    
    try{
        balance = await nftContract.balanceOf(address);
        
    }catch(error){
        console.log(error)
        balance = "unable to fetch balance"
    }

    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(3) span:first-of-type").innerText = balance;
    
})

// tokenURI for NFT tokenId
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(4) form").addEventListener("submit",async(event)=>{
    event.preventDefault()
    let tokenId = event.target[0].value;
    let uri;
    
    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(4) span:first-of-type").innerText = "";

    try{
        uri = await nftContract.tokenURI(tokenId);
        
    }catch(error){
        console.log("Unable to fetch URI");
        uri = "unable to fetch tokenURI"
    }

    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(4) span:first-of-type").innerText = uri;
    
})

// set a new baseURI (onlyOwner)
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(5) form").addEventListener("submit",async(event)=>{
    event.preventDefault()
    let newURI = event.target[0].value;

    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(5) span:first-of-type").innerText = "";
    
    try{
        await nftContract.setBaseURI(newURI);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(5) span:first-of-type").innerText = "setting new base uri";
    }catch(error){
        console.log("encountered the following error:",error);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(5) span:first-of-type").innerText = "failed ot set a new base uri";
    }  
})

// approve address to operate one of your NFTs
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(6) form").addEventListener("submit",async(event)=>{
    event.preventDefault()
    let spender = event.target[0].value;
    let tokenId = event.target[1].value;

    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(6) span:first-of-type").innerText = ``;
    
    try{
        await nftContract.approve(spender,tokenId);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(6) span:first-of-type").innerText = `approving ${spender} for NFT tokenId ${tokenId}`;
    }catch(error){
        console.log("encountered the following error:",error);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(6) span:first-of-type").innerText = `unable to approve ${spender} for tokenId ${tokenId}`;
    }  
})

// getApproved(tokenId)
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(7) form").addEventListener("submit",async(event)=>{
    event.preventDefault()
    let tokenId = event.target[0].value;

    let spender;

    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(7) span:first-of-type").innerText = ``;
    
    try{
        spender = await nftContract.getApproved(tokenId);
        
    }catch(error){
        console.log("encountered the following error:",error);
        spender = `unable to fetch spender for ${tokenId}`
    } 

    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(7) span:first-of-type").innerText = spender;
})

// setApprovalForAll()
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(8) form").addEventListener("submit",async(event)=>{
    event.preventDefault()
    let spender = event.target[0].value;

    let consent = event.target[1].value.trim()

    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(8) span:first-of-type").innerText = ``;
    
    if(consent == "YES"){
        try{
            await nftContract.setApprovalForAll(spender,true);
            document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(8) span:first-of-type").innerText = `Approving operator: ${spender} for all your NFTs`;
        }catch(error){
            console.log("encountered the following error:",error);
            document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(8) span:first-of-type").innerText = `Unable to approve ${spender} for all your NFTs`;
        }
    }else{
        try{
            await nftContract.setApprovalForAll(spender,false);
            document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(8) span:first-of-type").innerText = `Disapproving operator: ${spender} for all your NFTs`;
        }catch(error){
            console.log("encountered the following error:",error);
            document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(8) span:first-of-type").innerText = `Unable to disapprove ${spender} for all your NFTs`;
        }      
    }   
})

// isApprovedForAll(owner,operator)
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(9) form").addEventListener("submit",async(event)=>{
    event.preventDefault();
    let owner = event.target[0].value;

    let operator = event.target[1].value;

    let isApproved;

    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(9) span:first-of-type").innerText = "";
    
    try{
        isApproved = await nftContract.isApprovedForAll(owner,operator);
        
    }catch(error){
        console.log("encountered the following error:",error);
        isApproved = "unable to call isApprovedForAll()"
    }

    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(9) span:first-of-type").innerText = isApproved;
})

// transferFrom(from,to,tokenId) NFT contract
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(10) form").addEventListener("submit",async(event)=>{
    event.preventDefault();
    let from = event.target[0].value;

    let to = event.target[1].value;

    let tokenId = event.target[2].value;

    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(10) span:first-of-type").innerText = ``;
    
    try{
        await nftContract.transferFrom(from,to,tokenId);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(10) span:first-of-type").innerText = `transfered tokenId ${tokenId}, from ${from} to ${to}`;
    }catch(error){
        console.log("encountered the following error:",error);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(10) span:first-of-type").innerText = `transferFrom() execution failed`;
    }  
})

// safeTransferFrom(from,to,tokenId,data) NFT contract
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(11) form").addEventListener("submit",async(event)=>{
    event.preventDefault();
    let from = event.target[0].value;

    let to = event.target[1].value;

    let tokenId = event.target[2].value;

    let data = event.target[3].value;

    if(data.length == 0 || (data[0] != "0" && data[1] != "x")){
        data = "0x00";
    }

    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(11) span:first-of-type").innerText = ``;
    
    try{
        await nftContract.safeTransferFrom(from,to,tokenId,data);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(11) span:first-of-type").innerText = `transfered tokenId ${tokenId}, from ${from} to ${to} with data ${data}`;
    }catch(error){
        console.log("encountered the following error:",error);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(11) span:first-of-type").innerText = `safeTransferFrom() execution failed`;
    }  
})

// mint(to,tokenId) NFT contract
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(12) form").addEventListener("submit",async(event)=>{
    event.preventDefault();
    let receiver = event.target[0].value;

    let tokenId = event.target[1].value;


    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(12) span:first-of-type").innerText = ``;
    
    try{
        await nftContract.mint(receiver,tokenId);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(12) span:first-of-type").innerText = `minting NFT ${tokenId} to address ${receiver}`;
    }catch(error){
        console.log("encountered the following error:",error);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(12) span:first-of-type").innerText = `mint() execution failed`;
    }  
})

// burn(tokenId) NFt contract
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(13) form").addEventListener("submit",async(event)=>{
    event.preventDefault();

    let tokenId = event.target[0].value;


    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(13) span:first-of-type").innerText = ``;
    
    try{
        await nftContract.burn(tokenId);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(13) span:first-of-type").innerText = `burning NFT ${tokenId}`;
    }catch(error){
        console.log("encountered the following error:",error);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(13) span:first-of-type").innerText = `burn() execution failed`;
    }  
})

// getOwner() of NFT contract
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(14) form").addEventListener("submit",async(event)=>{
    event.preventDefault();

    let owner;


    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(14) span:first-of-type").innerText = ``;
    
    try{
        owner = await nftContract.getOwner();
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(14) span:first-of-type").innerText = `Owner: ${owner}`;
    }catch(error){
        console.log("encountered the following error:",error);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(14) span:first-of-type").innerText = `unable to get the owner`;
    }  
})

// transferOwnership() of NFT contract
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(15) form").addEventListener("submit",async(event)=>{
    event.preventDefault();

    let newOwner = event.target[0].value;


    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(15) span:first-of-type").innerText = ``;
    
    try{
        await nftContract.transferOwnership(newOwner);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(15) span:first-of-type").innerText = `transfering ownership to ${newOwner}`;
    }catch(error){
        console.log("encountered the following error:",error);
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(15) span:first-of-type").innerText = `unable to transfer ownership to ${newOwner}`;
    }  
})

// destroy ownership of NFT contract
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(16) form").addEventListener("submit",async(event)=>{
    event.preventDefault();

    let consent = event.target[0].value.trim();


    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(16) span:first-of-type").innerText = ``;
    
    if(consent == "YES"){

        try{
            await nftContract.destroyOwnership();
            document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(16) span:first-of-type").innerText = `destroying the ownership`;
        }catch(error){
            console.log("encountered the following error:",error);
            document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(16) span:first-of-type").innerText = `unable to destroy the ownership`;
        }
    } else{
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(16) span:first-of-type").innerText = ` tpye "YES" to confirm`; 
    }
  
})


// checking for supported interfaces
document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(17) form").addEventListener("submit",async(event)=>{
    event.preventDefault();

    let interfaceId = event.target[0].value.trim();


    document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(17) span:first-of-type").innerText = ``;

    let supported;
    
        try{
            supported = await nftContract.supportsInterface(interfaceId);
        }catch(error){
            console.log("encountered the following error:",error);
            supported = "call to supportsInterface() failed"
        }
        document.querySelector("#interact_with_nft_contract .col-6:nth-of-type(17) span:first-of-type").innerText = supported;  
})

// ____________________________________________________________ staking contract _______________________________________________________________________//

// stakedAmount(address)
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(1) form").addEventListener("submit",async(event)=>{
    event.preventDefault();

    let staker = event.target[0].value;


    document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(1) span:first-of-type").innerText = ``;

    let amount;
    
        try{
            amount = await stakerContract.stakedAmount(staker);
        }catch(error){
            console.log("encountered the following error:",error);
            amount = "unable to fetch the amount of staked NFTs"
        }
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(1) span:first-of-type").innerText = amount;  
})


// tokenStakedBy(tokenId)
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(2) form").addEventListener("submit",async(event)=>{
    event.preventDefault();

    let tokenId = event.target[0].value;


    document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(2) span:first-of-type").innerText = ``;

    let owner;
    
        try{
            owner = await stakerContract.tokenStakedBy(tokenId);
        }catch(error){
            console.log("encountered the following error:",error);
            owner = "unable to fetch the owner of the staked NFT"
        }
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(2) span:first-of-type").innerText = owner;  
})


// stakedTime(address)
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(3) form").addEventListener("submit",async(event)=>{
    event.preventDefault();

    let staker = event.target[0].value;


    document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(3) span:first-of-type").innerText = ``;

    let stakedTime;
    
        try{
            stakedTime = await stakerContract.stakedtime(staker);
            document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(3) span:first-of-type").innerText = stakedTime;
            console.log(stakedTime) 
        }catch(error){
            console.log("encountered the following error:",error);
            document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(3) span:first-of-type").innerText = "unable to fetch the staked time";  
        }
        
})

// unclaimedRewards(address)
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(4) form").addEventListener("submit",async(event)=>{
    event.preventDefault();

    let staker = event.target[0].value;

    document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(4) span:first-of-type").innerText = ``;

    let unclaimed;
    
        try{
            unclaimed = await stakerContract.unclaimedRewards(staker);
        }catch(error){
            console.log("encountered the following error:",error);
            owner = "unable to fetch the unclaimed rewards"
        }
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(4) span:first-of-type").innerText = unclaimed;  
})

// getRewardRate()
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(5) form").addEventListener("submit",async(event)=>{
    event.preventDefault();

    document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(5) span:first-of-type").innerText = ``;

    let rewardrate;
    
        try{
            rewardrate = await stakerContract.getRewardRate();
        }catch(error){
            console.log("encountered the following error:",error);
            rewardrate = "unable to fetch the current rewardRate"
        }
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(5) span:first-of-type").innerText = rewardrate;
})


// setRewardRate(newRate) restricted access for owner
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(6) form").addEventListener("submit",async(event)=>{
    event.preventDefault();

    let newRewardRate = event.target[0].value;

    document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(6) span:first-of-type").innerText = ``;

        try{
            await stakerContract.setRewardRate(newRewardRate);
            document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(6) span:first-of-type").innerText = "setting new reward rate"; 
        }catch(error){
            console.log("encountered the following error:",error);
            document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(6) span:first-of-type").innerText = "unable to set new reward rate"; 
        }  
})


// stake NFT, requires nftcontract to be approved spender of tokenId
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(7) form").addEventListener("submit",async(event)=>{
    event.preventDefault();

    let tokenId = event.target[0].value;

    document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(7) span:first-of-type").innerText = ``;

    try{
        await stakerContract.stake(tokenId);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(7) span:first-of-type").innerText = `staking NFT`;
    }catch(error){
        console.log(error);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(7) span:first-of-type").innerText = `unable to stake NFT, have you approved the stakingcontract ?`;
    }
})

// unstake an nft
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(8) form").addEventListener("submit",async(event)=>{
    event.preventDefault();

    let tokenId = event.target[0].value;

    document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(8) span:first-of-type").innerText = ``;

    try{
        await stakerContract.unstake(tokenId);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(8) span:first-of-type").innerText = `unstaking NFT ${tokenId}`;
    }catch(error){
        console.log(error);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(8) span:first-of-type").innerText = `unable to unstake NFT ${tokenId}`;
    }
})

// claim rewards to signer, owner-claiming to a third party not implemented
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(9) form").addEventListener("submit",async(event)=>{
    event.preventDefault();

    document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(9) span:first-of-type").innerText = ``;

    try{
        await stakerContract.claim(accounts[0]);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(9) span:first-of-type").innerText = `claiming rewards to ${accounts[0]}`;
    }catch(error){
        console.log(error);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(9) span:first-of-type").innerText = `unable to claim rewards`;
    }
})

// ERC20 token interactions

// get symbol name and decimals
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(10) form").addEventListener("submit",async(e)=>{
    e.preventDefault();
    let name;
    let symbol;
    let decimals;

    try{
        name = await stakerContract.name();
        symbol = await stakerContract.symbol();
        decimals= await stakerContract.decimals();

        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(10) span:first-of-type").innerHTML = `Name : ${name}`;
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(10) span:nth-of-type(2)").innerHTML = `Symbol : ${symbol}`;
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(10) span:nth-of-type(3)").innerHTML = `Decimals : ${decimals}`;
    }catch(e){
        console.log(e);
    }
})

// get totalsupply
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(11) form").addEventListener("submit",async(e)=>{
    e.preventDefault();
    let totalsSupply;
    try{
        totalsSupply = await stakerContract.totalSupply();
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(11) span").innerHTML = `Totalsupply: ${totalsSupply}`;
    }catch(e){
         console.log(e);
    }
});

// get balance of an address
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(12) form").addEventListener("submit",async(e)=>{
    e.preventDefault();
    let balance;
    let address = e.target[0].value;
    try{
        balance =await stakerContract.balanceOf(address);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(12) span").innerHTML = `Balance of ${address}  = ${balance}`;
    }catch(e){
        console.log(e);
    }
})

// transfer tokens to another address
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(13) form").addEventListener("submit",async(e)=>{
    e.preventDefault();
    let receiverAddress = e.target[0].value;
    let amount = e.target[1].value;
    try{
        let tx =await stakerContract.transfer(receiverAddress,amount);
        console.log(tx);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(13) span").innerHTML = `transfering tokens`;
    }catch(e){
        console.log(e);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(13) span").innerHTML = `transfer() failed`;
    }
})

// get allowance of a spender for an owners balance
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(14) form").addEventListener("submit",async(e)=>{
    e.preventDefault();
    let owner = e.target[0].value;
    let spender = e.target[1].value;
    try{
        let allowance =await stakerContract.allowance(owner,spender);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(14) span").innerHTML = `Allowance of Spender ${spender} for owner ${owner}'s balance  = ${allowance}`;
    }catch(e){
        console.log(e);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(14) span").innerHTML = `unable to fetch allowance`;
    }
})


// Approve an address to spend your tokens
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(15) form").addEventListener("submit",async(e)=>{
    e.preventDefault();
    let receiver = e.target[0].value;
    let amount = e.target[1].value;
    try{
        let tx =await stakerContract.approve(receiver,amount);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(15) span").innerHTML = `approving spender `;
        console.log(tx);
    }catch(e){
        console.log(e);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(15) span").innerHTML = `approve() failed`;
    }
})

// Transfer tokens from one account to another by using allowance
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(16) form").addEventListener("submit",async(e)=>{
    e.preventDefault();
    let owner = e.target[0].value;
    let receiver = e.target[1].value;
    let amount = e.target[2].value;
    try{
        let tx =await stakerContract.transferFrom(owner,receiver,amount);
        console.log(tx);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(16) span").innerHTML = `transfering tokens from ${owner} to ${receiver} `;
    }catch(e){
        console.log(e);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(16) span").innerHTML = `transferFrom() failed`;
    }
})


// Mint new Tokens
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(17) form").addEventListener("submit",async(e)=>{
    e.preventDefault();
    let receiver = e.target[0].value;
    let amount = e.target[1].value;
    try{
        let tx =await stakerContract.mint(receiver,amount);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(17) span").innerHTML = `minting new tokens to ${receiver} `;
        console.log(tx);
    }catch(e){
        console.log(e);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(17) span").innerHTML = `minting  failed `;
    }
})


// Burn Tokens
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(18) form").addEventListener("submit",async(e)=>{
    e.preventDefault();
    let amount = e.target[0].value;
    try{
        let tx =await stakerContract.burn(amount);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(18) span").innerHTML = `burning ${amount} tokens`;
        console.log(tx);
    }catch(e){
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(18) span").innerHTML = `burning failed`;
        console.log(e);
    }
})

// get current owner
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(19) form").addEventListener("submit",async(e)=>{
    e.preventDefault();
    try{
        let owner=await stakerContract.getOwner();
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(19) span").innerHTML = `current Owner:  ${owner}`;
    }catch(e){
        console.log(e);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(19) span").innerHTML = `unable to fetch owner`;
    }
})


// Transfer Ownership
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(20) form").addEventListener("submit",async(e)=>{
    e.preventDefault();
    let newOwner = e.target[0].value;
    try{
        let tx=await stakerContract.transferOwnership(newOwner);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(20) span").innerHTML = `transfering ownership`;
        console.log(tx)
    }catch(e){
        console.log(e);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(20) span").innerHTML = `transfering ownership failed`;
    }
})

// Destroy Ownership
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(21) form").addEventListener("submit",async(e)=>{
    e.preventDefault();
    let agreement = e.target[0].value.trim();
    if(agreement !== "YES"){
        console.log("type 'YES' to agree")
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(21) span").innerHTML = `type "YES" to proceed`;
        return;
    }
    try{
        let tx=await stakerContract.destroyOwnership();
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(21) span").innerHTML = `destroying ownership`;
        console.log(tx)
    }catch(e){
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(21) span").innerHTML = `destroying ownership failed`;
        console.log(e);
    }
})

//check for supported interfaces
document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(22) form").addEventListener("submit",async(e)=>{
    e.preventDefault();
    let interfaceId = e.target[0].value;
    try{
        let supported =await stakerContract.supportsInterface(interfaceId);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(22) span").innerHTML = `Interface with the ID ${interfaceId} is supported:  ${supported}`;
    }catch(e){
        console.log(e);
        document.querySelector("#interact_with_staking_contract .col-6:nth-of-type(22) span").innerHTML = `unable to call supporsInterface()`;
    }
})