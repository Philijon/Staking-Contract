// This file will use ganache / truffle / mocha / chai to perform unit tests on the ERC721Enumerable contract
// with the help of the testerContract, which is written only for that case

// import necessary artifacts 
const ERC721Enumerable = artifacts.require("ERC721Enumerable");

const testerContract = artifacts.require("testerContract");



// adjust these addresses to the by ganache provided ones

// let address1 = "0x64b7FFC15Fa8EC85d2b56835516CcA3895505067";
// let address2 = "0xDC2E35bdf7372eDdd82C51AC77d0C4FdF8081e5b";
// let address3 = "0xfD9faAd8af18ff0ebA111B8897c069d2f9479180";
// let address4 = "0xC8E5A47f2b716616883598365d194D1623c48B5b";
// let address5 = "0x932e5B1C4649245362f4E7c7Cc0d3cA110f95B5D";
// let address6 = "0x9696E20A1D0196C725C724120f3e5A5f023b8260";
// let address7 = "0x0a10861679DAeEa0b5FcfA8427f24eC914284d10";
// let address8 = "0x74De322E95c23ACb62307B8c75f29da19F345214";
// let address9 = "0xb4A02864A42aEaA9C287259b18555306295B7faF";
// let address10 = "0xeC0E3c00028849ECCeAD4855581ccAF257CA7e0F";



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


contract("ERC721Enumerable",async()=>{

    
    let NFT;

    before(async()=>{
        // initializing the NFT with a deployed instance of the NFT contract with constructor arguments as provided in "migrations\5_migrate_Stakingcontract.js"
        NFT = await ERC721Enumerable.deployed();
    });


    // checking the nft contract address, which should have a length of 40 + 2 ("0x" prefix)
    it("should return the addresses of the deployed ERC721Enumerable contract",async()=>{

        let nftaddress = await NFT.address;

        assert.lengthOf(nftaddress, 42, "Contract not succesfully deployed");
        
    })


    it("will test the supportsInterface functionality of the ERC721",async()=>{
        
        // assigning an instance of the deployed testerContract
        let tester = await testerContract.deployed();

        // testerContract function which returns the type(IERC721).interfaceId
        let id = await tester.getInterface721();

        // testercontract function which calls a contractaddress and checks for IERC165 supported Interfaces, takes two arguments:
        // an address to call
        // the interfaceId, to check whever its supported
        let retval = await tester.testIERC165(NFT.address,id)

        // testerContract function which returns the type(IERC721Enumerable).interfaceId
        let idENumerable = await tester.getIERC721Enumerable();

        // testercontract function which calls a contractaddress and checks for IERC165 supported Interfaces, takes two arguments:
        // an address to call
        // the interfaceId, to check whever its supported
        let retval2 = await tester.testIERC165(NFT.address,idENumerable);

        assert.equal(retval, true, "NFTcontract returned false for IERC721 supported");
        assert.equal(retval2, true, "NFTcontract returned false for IERC721Enumerable supported");
    })

    it("should get the NFT name and symbol",async()=>{

        // uses the name() and symbol() getter functions of the NFT contract to return its name and symbol
        // expected return values have to be adjusted if constructor arguments in the migration files are modified
        let name =await NFT.name();
        let symbol = await NFT.symbol();

        assert.equal(name, "MyNFT", "NFT returned wrong Name, check constructor arguments");
        assert.equal(symbol,"MNFT","NFT returned wrong symbol, check constructor arguments")

        
    })

    // testing the mint() function by minting 10 nfts
    // mint function has restricted acces onlyOwner() which is the address that created the contract, in this case address 1
    // address 1 is used by default to execute contract calls, so its unnecessary to specify which address mints these NFTs

    it("should use the mint function to mint 10 nfts to the first address",async()=>{

        try{
            await NFT.mint(address1,1);
            await NFT.mint(address1,2);
            await NFT.mint(address1,3);
            await NFT.mint(address1,4);
            await NFT.mint(address1,5);
            await NFT.mint(address1,6);
            await NFT.mint(address1,7);
            await NFT.mint(address1,8);
            await NFT.mint(address1,9);
            await NFT.mint(address1,10);
        }catch(error){
            console.log(error);
        }
    })
    

    // testing the restricted access for the mint() function by calling it from a non-owner address, thus it should throw
    // if ownership has been transfered to address2, calling address needs to be adjusted, otherwise the transaction wont be reverted
    it("should fail when a nonOwner tries to mint an NFT",async()=>{
        try{

            // calling the mint() fcuntion from address2 (not the owner)
            await NFT.mint(address1,11,{from: address2});
        }catch(error){

            // asserting an error occured, and the error message includes the restricted access revert reason, then returning
            assert.include(error.message, "Only owner can execute this function", "transaction did not get reverted, check who is the current owner address");
            return;
        }

        // asserting false, this code should not get reached unless the transaction did not revert, thus failing the unit test
        assert(false)
    });


    // trying to mint an already existing NFT (tokenId 2 already exists) as the owner (currently address1),
    // ERC721 checks that the NFT is currently not owned (previousOwner == address(0)), otherwise revert,
    // since tokenId 2 is currently held by address 1, it should throw
    it("should fail when one tries to mint an already existing NFT",async()=>{


        try{
            // trying to mint tokenId 2 as address1, which has owner access
            await NFT.mint(address1,2,{from: address1});
        }catch(error){
            // asserting the transaction reverted, with the ERC721InvalidSender costum error,
            // which has no revert reason implemented, so the error message should only include "custom error", then returning
            assert.include(error.message, "Custom error", "transaction did not throw, check the NFT already existed");
            return;
        }
        // asserting false, this code should not get reached unless the transaction did not revert, thus failing the unit test
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
            assert(error.message)
        }


        try{
            await NFT.mint(address1,1,{from: address1});
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

    //ownerof and balanceOf function

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

        assert(balance == 10);
        assert(owner == address1);
    })

    it("will test the tokenOfOwnerByIndex function, which comes with the enumerable extension",async()=>{

        //owners tokens enumeration alters when burning and minting again

        let token;
            
            try{
                token= await NFT.tokenOfOwnerByIndex(address1,0);
                assert(token == 10);
                token= await NFT.tokenOfOwnerByIndex(address1,1);
                assert(token == 2);
                token= await NFT.tokenOfOwnerByIndex(address1,2);
                assert(token == 3);
            }catch(error){
                console.log(error);
            }
            
        assert(true);
        
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
            assert(error.message.includes("Invalid URI"));
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

    // approve/transferFrom function

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

    it("should fail when not the owner of the NFT tries to approve it",async()=>{
        try{
            await NFT.approve(address5,4,{from: address7});
        }catch(error){
            assert(error.message);
            return
        }
        assert(false);
    })

    it("will give approval for all nfts to address4, then check isApprovedForAll",async()=>{
        try{
            await NFT.setApprovalForAll(address4,true,{from:address1});
        }catch(error){
            console.log(error)
        }

        let response;

        try{
            response = await NFT.isApprovedForAll(address1,address4);
        }catch(error){
            console.log(error)
        }

        assert(response == true);
    })

    it("will use the transferFrom function to spend address3 allowance to transfer it to address3",async()=>{
        try{
            await NFT.transferFrom(address1,address3,2,{from:address3});
        }catch(error){
            console.log(error);
        }

        let balance = await NFT.balanceOf(address3);
        let owner = await NFT.ownerOf(2);
        assert(balance == 1 &&owner == address3);
    })

    it("will check that tokenId 2 no longer has an approved spender",async()=>{
        let approved;
        try{
            approved = await NFT.getApproved(2);
        }catch(error){
            console.log(error);
        }

        assert(approved.includes("0x00000000000000000000"));
    })

    it("will use address4 approvalforall to transfer tokenId 6 to address7, then verify address7 is the new Owner",async()=>{
        try{
            await NFT.transferFrom(address1,address7,6,{from:address4});
        }catch(error){
            console.log(error);
        }
        let balance;
        let owner;

        try{
            balance = await NFT.balanceOf(address7);
            owner = await NFT.ownerOf(6);
        }catch(error){
            console.log(error);
        }

        assert(balance== 1 && owner == address7);
    })

    it("will clear address4 approvalForAll, then verify it is no longer allowed to spend address1's NFTs",async()=>{
        try{
            await NFT.setApprovalForAll(address4,false,{from:address1});
        }catch(error){
            console.log(error);
        }

        let approved = await NFT.isApprovedForAll(address1,address4);
        assert(approved == false);
    })

    it("will give approval to spend NFT nr.8 to several addresses, then check that only the latest approval is valid",async()=>{
        try{
            await NFT.approve(address2,8,{from:address1});
        }catch(error){
            console.log(error);
        }

        try{
            await NFT.approve(address3,8,{from:address1});
        }catch(error){
            console.log(error);
        }

        let approved;

        try{
            approved = await NFT.getApproved(8);
            assert(approved == address3);
        }catch(error){
            console.log(error);
        }
    })

    it("should fail when a not approved address tries to trasnfer an nft",async()=>{
        
        try{
            await NFT.transferFrom(address1,address7,9,{from:address9});
        }catch(e){
            assert(e.message.includes("Custom error"));
            return;
        }


        assert(false)
    })

// it("will use transferFrom to transfer NFT 8 to address3, ",async()=>{
//     try{
//         await NFT.transferFrom(address1,address3,8,{from:address3});
//     }catch(error){
//         console.log(error)
//     };

//     let newOwner = await NFT.ownerOf(8);

//     assert(newOwner == address3);

//     let approved = await NFT.getApproved(8);
//     console.log(approved)
    
// })

})