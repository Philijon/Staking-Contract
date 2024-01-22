const stakingContract = artifacts.require("stakingContract");

const ERC721 = artifacts.require("ERC721");

const testerContract = artifacts.require("testerContract");


let address1 = "0x5ac5F3361D782DB973c9c65dF716D38307a755e2";
let address2 = "0x58fBFbB09aA6f5f187dfCe903F9C8AB8AFbEC030";
let address3 = "0x620F84B4a2d90c1c7fe9Ed6CC01F01427eE6a294";
let address4 = "0xfa00fB886DaaE3230FEcE4bCC4C24008F6438fD0";
let address5 = "0x89D23CFA2A3123F489DC896f62C5130CfdF504Fe";
let address6 = "0x453DF75F581e621446b8c110819fA053C6A656d2";
let address7 = "0x525Dc7C17655Fd080969dD040cb6B79764FF3403";
let address8 = "0xDE6547B6fA7a5849B0Bd698393C154191211E275";
let address9 = "0xEBb061067C47605EaCDA624BF2E6c48010937E48";
let address10 = "0x29f33A3D42Fa43F6563aa98875b95789a6086D4d";

before(async()=>{
    NFT = await ERC721.deployed();
    Staker = await stakingContract.deployed();
});

it("should return the addresses of both deployed contracts",async()=>{
    let nftaddress = await NFT.address;
    let stakeraddress = await Staker.address;

    assert(stakeraddress != "" && nftaddress != "");
})

//testing the NFT-contract#

it("will test the supportsInterface functionality of the ERC721",async()=>{
    
    let tester = await testerContract.deployed();
    let id = await tester.getInterface721();
    let retval = await tester.testIERC165(NFT.address,id)

    assert(retval === true);
})

it("should get the NFT name and symbol",async()=>{
    let name =await NFT.name();
    let symbol = await NFT.symbol();

    assert(name === "MyNFT" && symbol === "MNFT");
})

// mint function

it("should use the mint function to mint 3 nfts to the first address",async()=>{

    try{
        await NFT.mint(address1,1,"0x00");
        await NFT.mint(address1,2,"0x00");
        await NFT.mint(address1,3,"0x00");
    }catch(error){
        console.log(error);
    }
})

it("should fail when a nonOwner tries to mint an NFT",async()=>{
    try{
        await NFT.mint(address1,4,"0x00",{from: address2});
    }catch(error){
        assert(error.message.includes("Only owner can execute this function"));
        return;
    }

    assert(false)
});

it("should fail when one tries to mint an already existing NFT",async()=>{
    try{
        await NFT.mint(address1,2,"0x00",{from: address1});
    }catch(error){
        assert(error.message.includes("Invalid Sender"));
        return;
    }

    assert(false);
})

it("will burn nft 1,verify it does no longer exist, then mint it again",async()=>{

    
    try{
        await NFT.burn(1,{from: address1});
    }catch(error){
        console.log(error)
    }

    try{
        await NFT.ownerOf(1);
    }catch(error){
        assert(error.message.includes("Token does not exist"))
    }


    try{
        await NFT.mint(address1,1,"0x00",{from: address1});
    }catch(error){
        console.log(error);
    }

    let owner;

    try{
        owner = await NFT.ownerOf(1);
    }catch(error){
        console.log(error);
    }

    assert(owner == address1);

    
})

it("testing the balanceOf and the ownerOf function",async()=>{
    let balance;
    try{
        balance = await NFT.balanceOf(address1);
    }catch(error){
        console.log(error);
    }

    let owner;
    try{
        owner =await NFT.ownerOf(2);
    }catch(error){
        console.log(error);
    }

    assert(balance == 3);
    assert(owner == address1);
})

// getting and setting the URI

it("should test the tokenURI function, which should return an empty string as baseURI is not yet set",async()=>{

    let response = "lirum larum";
    try{
        response =await NFT.tokenURI(2);
        
    }catch(error){
        console.log(error);
    }

    assert(response == "");
})

it("should set the baseURI, then once again try the tokenURI function",async()=>{
    try{
        await NFT.setBaseURI("test_test_test",{from: address1});
    }catch(error){
        console.log(error);
    }

    let response;
    try{
        response = await NFT.tokenURI(3);
    }catch(error){
        console.log(error);
    }

    assert(response == "test_test_test3")
})

it("should try the setBaseURI function once again, this time with invalid baseURI, thus it should throw",async()=>{
    try{
        await NFT.setBaseURI("");
    }catch(error){
        assert(error.message.includes("invalid URI"));
        return;
    }

    assert(false);
})

it("should try setBaseURI from a non-Owner, should fail",async()=>{

    try{
        await NFT.setBaseURI("theRedFox",{from: address2});
    }catch(error){
        assert(error.message.includes("Only owner can execute this function"));
        return;
    }  

    assert(false);
})

// approve function

it("tries to approve the frist NFT from address1 to address 3, then check the tokenApprovals",async()=>{
    try{
        await NFT.approve(address3,2,{from: address1});
    }catch(error){
        console.log(error);
    }

    let approved;
    try{
        approved = await NFT.getApproved(2);
    }catch(error){
        console.log(error);
    }

    assert(approved==address3);
})