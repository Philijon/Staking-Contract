// This file will use ganache / truffle / mocha / chai to perform unit tests on the ERC721Enumerable contract
// with the help of the testerContract, which is written only for that case

// import necessary artifacts 
const ERC721Enumerable = artifacts.require("ERC721Enumerable");

const testerContract = artifacts.require("testerContract");



// adjust these addresses to the by ganache provided ones

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
        console.log(`_____________________________________________________________________________\n THE NFT CONTRACT ADDRESS IS: ${nftaddress}`)

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
    // Since address 1 is used by default to execute contract calls, its unnecessary to specify which address mints these NFTs

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


    // testing the burning function, then minting that no longer existing NFT again
    it("will burn nft 1,verify it does no longer exist, then mint it again",async()=>{

        // burning NFT tokenId 1, currently held by address1,
        // so specifying which address is sending the transaction is unnecessary (address 1 by default)
        try{
            await NFT.burn(1);
        }catch(error){
            console.log(error)
        }

        let owner;
        // trying to get the current owner of NFT tokenId1, which at this point is address(0),
        // so that transaction should fail, as it will trigger the _requireOwned() function of the ERC721,
        // which reverts in that case, triggering the custom Error ERC721NonExistingToken
        try{
            owner = await NFT.ownerOf(1);
        }catch(error){
            assert.include(error.message,"VM Exception while processing transaction","Transaction did not fail, make sure NFT is actually burned")
        }

        // Minting the currently not existing NFT tokenId 1, from address 1 (the current owner of the contract),
        // specifying the msgSender is once again unnecessary 
        try{
            await NFT.mint(address1,1);
        }catch(error){
            console.log(error);
        }

        
        // getting the owner of the newly minted NFT tokenId 1, which should now be address1
        try{
            owner = await NFT.ownerOf(1);
        }catch(error){
            console.log(error);
        }
        // asserting the returned address for the owner of tokenId1 is equal to address1
        assert.equal(owner, address1,"Owner of tokenId 1 is not address 1, make sure it actually minted tokenId 1");
        
    })

    //test ownerof and balanceOf function
    it("testing the balanceOf and the ownerOf function",async()=>{
        
        let balance;

        // getter contract function to return the amount of NFTs owned by an address
        try{
            balance = await NFT.balanceOf(address1);
        }catch(error){
            console.log(error);
        }

        let owner;

        // getter contract function to return the owner of an NFT tokenId
        try{
            owner =await NFT.ownerOf(2);
        }catch(error){
            console.log(error);
        }

        assert.equal(balance.words[0],10,"Balance returned wrong value, make sure previous tests all successfully executed");
        assert.equal(owner,address1,"ownerOf(2) returned the wrong address, make sure it got succesfully minted by address1");
    })


    // testing the ERC721Enumerable functionallity tokenOfOwnerByIndex
    it("will test the tokenOfOwnerByIndex function, which comes with the enumerable extension",async()=>{

        // REMINDER: owners token enumeration alters when burning and minting again,
        // due to ERC721Enumerable _removeTokenFromOwnerEnumeration(), triggerd by ERC721Enumerable _update() logic

        let token;
            
            try{
                // uisng tokenOfOwnerByIndex getter fucntion, to return the nth NFT owned by address1 (starting index = 0),
                // then asserting it returned the right tokenId
                token= await NFT.tokenOfOwnerByIndex(address1,0);
                assert.equal(token,10,"First NFT of address1 returned wrong tokenId");
                token= await NFT.tokenOfOwnerByIndex(address1,1);
                assert.equal(token,2,"Second NFT of address 1 returned wrong tokenId");
                token= await NFT.tokenOfOwnerByIndex(address1,2);
                assert.equal(token,3,"Third NFT of address 1 returned wrong tokenId");
            }catch(error){
                console.log(error);
            }
        
    })


    // testing the getter function for the tokenURI
    it("should test the tokenURI function, which should return an empty string as baseURI is not yet set",async()=>{

        // initializing the response with a nonsense string, should be overwritten by the tokenURI() function later
        let response = "lirum larum";
        
        // overwriting the response
        // contracts internal baseURI is not yet set at this point (baseURI = "" by default),
        // so the tokenURI() function returns an empty string
        try{
            response =await NFT.tokenURI(2);
            
        }catch(error){
            console.log(error);
        }

        // asserting the tokenURI() actually returned an empty tring
        assert.equal(response,"","tokenURI did not return an empty string, has _basicURI value changed ?");
    })


    // testing the setBaSeURI() function, which sets a new _basicURI and  has restricted access only for the owner,
    // then checking the tokenURI() now returns the correct string
    it("should set the baseURI, then once again try the tokenURI function",async()=>{

        // setting a new _basicURI. Restricted access only for owner of the contract,
        // which is currently address1, so specifying the msgSender is unnecessary (address1 by default)
        try{
            await NFT.setBaseURI("test_test_test");
        }catch(error){
            console.log(error);
        }

        // initializing the response with nonsense
        let response = "total_nonsense";

        // overwriting the response with the return value of the tokenURI() function,
        // which should concatinate the basicURI with the tokenId
        try{
            response = await NFT.tokenURI(3);
        }catch(error){
            console.log(error);
        }

        // asserting the returned value is the concatination of the new _basicURI and tokenId
        assert.equal(response,"test_test_test3","Return value is not the concatination of the _basicURI and the tokenId, has the _basicURI value changed ?")
    })

    // testing the setBaseURI() function reverts when the new URI is invalid,
    // which happens when an empty string is provided as the new _basicURI by the owner
    it("should try the setBaseURI function once again, this time with invalid baseURI, thus it should throw",async()=>{
        
        // trying to set the _basicURI to an empty string with msgSender = address1, who is the current owner
        // this should fail, as the new _basicURI is invalid
        try{
            await NFT.setBaseURI("");
        }catch(error){

            // asserting the transaction got reverted because of an invalid URI, then returning
            assert.include(error.message,"Invalid URI","function did not throw because of an invalid provided URI");
            return;
        }

        // asserting false, this code should not get reached unless the transaction did not revert, thus failing the unit test
        assert(false);
    })

    // testing the setBaseURi() function throws when called from a non Owner
    it("should try setBaseURI() from a non-Owner, should fail",async()=>{

        // calling the setBaseURI() function with msgSender = address2, who is not the owner
        try{
            await NFT.setBaseURI("theRedFox",{from: address2});
        }catch(error){

            // asserting the transaction got reverted because of restricted owner access, then returning
            assert.include(error.message,"Only owner can execute this function","transaction did not fail because of restricted owner access, has the owner of the contract changed?");
            return;
        }  
        
        // asserting false, this code should not get reached unless the transaction did not revert, thus failing the unit test
        assert(false);
    })

    // testing the approve() and getApproved() function to give approval to address3 to spend NFT tokenId 2, which currently belongs to address1
    // then verying address 3 is approved to spend tokenId 2

    it("tries to approve the frist NFT from address1 to address 3, then check the tokenApprovals",async()=>{
        
        try{

            // using the approve() function to approve address3 to spend tokenId1. 
            // currently held by address1, so it has to be the msgSender for the transaction to succed,
            // thus specification of the msgSender is once again unnecessary
            await NFT.approve(address3,2);
        }catch(error){
            console.log(error);
        }

        let approved;
        try{

            // getter function to return the address that is approved to spend NFT tokenId
            approved = await NFT.getApproved(2);
        }catch(error){
            console.log(error);
        }

        // asserting the returned approved address to spend tokenId 2 is in fact address3
        assert.equal(approved,address3,"address3 has not be returned as approved for tokenId 2");
    })

    // testing the approve() function reverts when not the owner of the NFT tries to approve a spender
    it("should fail when not the owner of the NFT tries to approve it",async()=>{
        try{

            // callying the approve() function to give address 5 approval to spend tokenId 4,
            // the msgSender = address7, who is not the owner of the NFT nor is he approved for all of address1 NFts
            await NFT.approve(address5,4,{from: address7});
        }catch(error){

            // transaction should fail, triggering the ERC721InvalidApprover custom error
            // checking the transaction failed with Custom error reason, then returning
            assert.include(error.message,"Custom error","transaction should have triggered the Custom error ERC721InvalidApprover, it didnt");
            return
        }

        // asserting false, this code should not get reached unless the transaction did not revert, thus failing the unit test
        assert(false);
    })

    // test for setApprovalForAll(), which gives an address control for all of another address NFTs,
    // and isApprovedForAll() which returns whever an address is approved to operate all of another addresses NFTS or not
    it("will give approval for all nfts to address4, then check isApprovedForAll",async()=>{
        try{

            // giving address4 approval to operate all of address1 NFTs, msgSender specification unnecessary
            // argument 1 : address who gets approved for all
            // argument 2 : bool value whever it is approved to or not
            await NFT.setApprovalForAll(address4,true);
        }catch(error){
            console.log(error)
        }

        let response;

        try{

            // using the getter function which returns whever an address "operator" is approved to opperate all of 
            // another addresses NFTs, should return true
            response = await NFT.isApprovedForAll(address1,address4);
        }catch(error){
            console.log(error)
        }

        // asserting isApprovedForAll() return true, representing that address4 is in fact approved to opperate all of address1 NFTs
        assert.equal(response,true,"isApprovedForAll() did not return true");
    })


    // testing the transferFrom with an approved address3 for NFT tokenId 2, then checking it actually got transfered
    it("will use the transferFrom function to spend address3 allowance to transfer NFT tokenId 2 to address3",async()=>{
        try{

            // transfering NFT tokenId 2 from address1 to address3, msgSender specified as address3, who has been approved for NFT tokenId 2 by address1
            // argument 1 : from address
            // argument 2 : to address
            // argument 3 : NFT tokenId
            // argument 4 : Object to specify which address to send the transaction from
            await NFT.transferFrom(address1,address3,2,{from:address3});
        }catch(error){
            console.log(error);
        }

        let balance 
        let owner


        // using the balanceOf() getter function for address3, which should after the transferFrom() return 1,
        // and ownerOf() getter function for NFT tokenId 2, which should now return address3 as its new owner
        try{
            balance = await NFT.balanceOf(address3);
            owner = await NFT.ownerOf(2);
        }catch(error){
            console.log(error)
        }

        // asserting both functions ownerOf() and balanceOf() returned the expected values after the transferFrom(),
        // which are balanceOf(address3) = 1, ownerOf(2) = address3
        assert.equal(balance,1,"balanceOf(address3) did not return 1");
        assert.equal(owner,address3,"ownerOf(2) did not return address3");
    })


    // checking that after transfering an NFT, its approval is deleted,
    // which is equal to setting the approved address to address(0)
    it("will check that tokenId 2 no longer has an approved spender",async()=>{
        let approved;

        // using the getterfunction getApproved() to get the current approved address for NFT tokenId 2,
        // which should return address(0)
        try{
            approved = await NFT.getApproved(2);
        }catch(error){
            console.log(error);
        }

        // asserting the getApproved(2) actually returned the zero address
        assert.include(approved,"0x0000000000000000000000000000000000000000","getApproved(2) did not return the zero address");
    })


    // will check that also an address approved to operate all of another addresses NFTs can successfully use transferFrom()
    it("will use address4 approvalforall to transfer tokenId 6 to address7, then verify address7 is the new Owner",async()=>{
        
        try{

            // using transferFrom() to transfer NFT tokenId 6 from address1 to address7, 
            // specifying address4 is the msgSender, which has previously been approved for all NFTs by address 1
            // argument 1 : from address
            // argument 2 : to address
            // argument 3 : NFT tokenId
            // argument 4 : Object, specifying the address which initiates the transaction
            await NFT.transferFrom(address1,address7,6,{from:address4});
        }catch(error){
            console.log(error);
        }
        let balance;
        let owner;

        // using the balanceOf() getter function for address7, which should after the transferFrom() return 1,
        // and ownerOf() getter function for NFT tokenId 6, which should now return address7 as its new owner
        try{
            balance = await NFT.balanceOf(address7);
            owner = await NFT.ownerOf(6);
        }catch(error){
            console.log(error);
        }

        // asserting both functions ownerOf() and balanceOf() returned the expected values after the transferFrom(),
        // which are balanceOf(address7) = 1, ownerOf(6) = address7
        assert.equal(balance,1,"balanceOf(address7) did not return 1");
        assert.equal(owner,address7,"ownerOf(6) did not return address7");
    })


    // testing an address can no longer use transferFrom once its approvalForAll is removed, nor is it approved for a specific tokenId
    it("will clear address4 approvalForAll, then verify it is no longer allowed to spend address1's NFTs",async()=>{
        try{

            // clearing the approval for all for address4 to no longer be able to operate all of address1 NFTs,
            // by giving false value as the bool argument of the setApprovalForAll() function
            // specifying address1 as the msgSender is unnecessary
            // argument 1 : address to set approval for all for
            // argument 2 : bool value whever the address is approved for all or not
            await NFT.setApprovalForAll(address4,false);
        }catch(error){
            console.log(error);
        }

        // using the getter function isApprovedForAll(), to return whever address4 is still approved for all of address1 NFTs
        let approved = await NFT.isApprovedForAll(address1,address4);

        // asserting isApprovedForAll() returned false for address4 to be approved for all of address1 NFTs
        assert.equal(approved,false,"isApprovedForAll(address1,address4) did not return false");
    })


    // testing only the latest approved address for an NFT tokenId can actually transfer it,
    // as the latest approve for the same tokenId will overwrite previous ones
    it("will give approval to spend NFT nr.8 to several addresses, then check that only the latest approval is valid",async()=>{
        try{

            // approving address2 for NFT tokenId 8, which is currently held by address1, specifying msgSender address is unnecessary
            await NFT.approve(address2,8);
        }catch(error){
            console.log(error);
        }

        try{

            // giving approval for the same NFT tokenId 8, still held by address1, to another address, which will overwrite the previous approval
            await NFT.approve(address3,8);
        }catch(error){
            console.log(error);
        }

        let approved;

        // using getterfunction getApproved() to check which address is currently approved for NFT tokenId 8
        try{
            approved = await NFT.getApproved(8);
        }catch(error){
            console.log(error);
        }

        // asserting the getApproved() function actually returned address3
        assert.equal(approved,address3,"getApproved(8) did not return address3");
    })


    // testing an address who is neither approved nor approvedForAll cannot transfer an NFT from its owner
    it("should fail when a not approved address tries to trasnfer an nft",async()=>{
        
        try{

            // address9, which is not approved for NFT tokenId 9, nor is it approved for all of address1 NFTs,
            // trying to transfer NFT tokenId 9 from address1 to address9, which should fail and trigger the custom error ERC721InsufficientApproval
            // argument 1 : address from
            // argument 2 : address to
            // argument 3 : NFT tokenId
            // argument 4 : Object to specify the msgSender
            await NFT.transferFrom(address1,address7,9,{from:address9});
        }catch(error){

            // asserting the transaction reverted and triggered the Custom error, then returning
            assert.include(error.message,"Custom error","transaction call did not trigger Custom error");
            return;
        }

        // asserting false, this code should not get reached unless the transaction did not revert, thus failing the unit test
        assert(false)
    })
})