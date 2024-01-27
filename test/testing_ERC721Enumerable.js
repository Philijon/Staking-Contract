const stakingContract = artifacts.require("stakingContract");

const ERC721Enumerable = artifacts.require("ERC721Enumerable");

const testerContract = artifacts.require("testerContract");


let address1 = "0x64b7FFC15Fa8EC85d2b56835516CcA3895505067";
let address2 = "0xDC2E35bdf7372eDdd82C51AC77d0C4FdF8081e5b";
let address3 = "0xfD9faAd8af18ff0ebA111B8897c069d2f9479180";
let address4 = "0xC8E5A47f2b716616883598365d194D1623c48B5b";
let address5 = "0x932e5B1C4649245362f4E7c7Cc0d3cA110f95B5D";
let address6 = "0x9696E20A1D0196C725C724120f3e5A5f023b8260";
let address7 = "0x0a10861679DAeEa0b5FcfA8427f24eC914284d10";
let address8 = "0x74De322E95c23ACb62307B8c75f29da19F345214";
let address9 = "0xb4A02864A42aEaA9C287259b18555306295B7faF";
let address10 = "0xeC0E3c00028849ECCeAD4855581ccAF257CA7e0F";

before(async()=>{
    NFT = await ERC721Enumerable.deployed();
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
    let idENumerable = await tester.getIERC721Enumerable();
    let retval2 = await tester.testIERC165(NFT.address,idENumerable);

    assert(retval === true);
    assert(retval2 == true);
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

    let token;
        
    try{
        token= await NFT.tokenOfOwnerByIndex(address1,0);
        console.log(token);
        token= await NFT.tokenOfOwnerByIndex(address1,1);
        console.log(token);
        token= await NFT.tokenOfOwnerByIndex(address1,2);
        console.log(token);
        console.log("done")
    }catch(error){
        console.log(error);
    }

    
    try{
        await NFT.burn(1,{from: address1});
    }catch(error){
        console.log(error)
    }

        
    try{
        token= await NFT.tokenOfOwnerByIndex(address1,0);
        console.log(token);
        token= await NFT.tokenOfOwnerByIndex(address1,1);
        console.log(token);
        // token= await NFT.tokenOfOwnerByIndex(address1,2);
        // console.log(token);
        console.log("done")
    }catch(error){
        console.log(error);
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

    
        
    try{
        token= await NFT.tokenOfOwnerByIndex(address1,0);
        console.log(token);
        token= await NFT.tokenOfOwnerByIndex(address1,1);
        console.log(token);
        token= await NFT.tokenOfOwnerByIndex(address1,2);
        console.log(token);
        console.log("done")
    }catch(error){
        console.log(error);
    }

    
})

it("testing the balanceOf and the ownerOf function",async()=>{
    let balance;
    try{
        balance = await NFT.balanceOf(address1);
        console.log(balance);
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

// it("will test the tokenOfOwnerByIndex function, which comes with the enumerable extension",async()=>{

//     let token;
        
//         try{
//             token= await NFT.tokenOfOwnerByIndex(address1,0);
//             console.log(token);
//             token= await NFT.tokenOfOwnerByIndex(address1,1);
//             console.log(token);
//             token= await NFT.tokenOfOwnerByIndex(address1,2);
//             console.log(token);
//             console.log("done")
//         }catch(error){
//             console.log(error);
//         }
        
//     assert(true);
    
// })

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