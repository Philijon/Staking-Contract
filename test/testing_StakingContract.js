// This file will use ganache / truffle / mocha / chai to perform unit tests on the staking contract
// with the help of the testerContract, which is written only for that case

// import necessary artifacts 
const stakingContract = artifacts.require("stakingContract");

const ERC721Enumerable = artifacts.require("ERC721Enumerable");



// adjust these addresses to the by ganache provided ones

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


// let address1 = "0x5ac5F3361D782DB973c9c65dF716D38307a755e2";
// let address2 = "0x58fBFbB09aA6f5f187dfCe903F9C8AB8AFbEC030";
// let address3 = "0x620F84B4a2d90c1c7fe9Ed6CC01F01427eE6a294";
// let address4 = "0xfa00fB886DaaE3230FEcE4bCC4C24008F6438fD0";
// let address5 = "0x89D23CFA2A3123F489DC896f62C5130CfdF504Fe";
// let address6 = "0x453DF75F581e621446b8c110819fA053C6A656d2";
// let address7 = "0x525Dc7C17655Fd080969dD040cb6B79764FF3403";
// let address8 = "0xDE6547B6fA7a5849B0Bd698393C154191211E275";
// let address9 = "0xEBb061067C47605EaCDA624BF2E6c48010937E48";
// let address10 = "0x29f33A3D42Fa43F6563aa98875b95789a6086D4d";


contract("Stakercontract",async()=>{


    let NFT;
    let StakerContract;

    before(async()=>{


        // initializing two variables with instances of the deployed ERC721ENumerable contract,
        // and the deployed stakingcontract with new parameters:
        // param 1 : address of the deployed NFT contract
        // param 2 : string which will be passed to the constructor as the name of the token paid as reward
        // param 3 : string which will be passed to the constructor as the symbol of the token paid as reward
        // param 4 : Number which will be passed to the constructor as the amount of tokens paid per second per NFT staked
        NFT = await ERC721Enumerable.deployed();
        StakerContract = await stakingContract.new(NFT.address,"RewardToken","RWT",5000);
    });


    // testing the staker contract got deployed by checking its address
    it("should return the address of the deployed staking contract",async()=>{

        // asserting the staker contract address returns a string of length = 42, 40 characters + 0x prefix
        assert.lengthOf(StakerContract.address,42,"Stakercontract did appearently not deploy porperly");
    });


    // testing the implementation of onERC721Received, which should return the bytes4 value 0x150b7a02,
    // which represents the onERC721Received.selector
    it("will test the implementation of the erc721 onERC721Received functionality of the contract, which should return the onERC721Received selector",async()=>{
        // 0x150b7a02
        let result;
        try{

            // calling the onERC721Received() function of staking contract, parameters representing the transferFrom() parameters
            result = await StakerContract.onERC721Received(address1,address2,1,"0x00");
        }catch(error){
            console.log(error);
        }

        // asserting the onERC721Received actually returned the correct value
        assert.equal(result,0x150b7a02,"Stakercontract.onERC721Received did not return the correct bytes4 value")
    });


    // approving the stakingcontract to transfer NFT tokenId 1 from address1 after minting it,
    // which is necessary to call the staking function of the staker contract later
    it("should give the staking contract approval to transfer nft 1 from address1",async()=>{
        
        // minting (restricted owner access) NFT tokenId 1 by address1, which is currently the owner of the NFT contract,
        // thus msgSender specification unnecessary
        // param 1 : address receiving the minted NFT
        // param 2 : number tokenId to be minted
        try{
            await NFT.mint(address1,1)
        }catch(error){
            console.log(error)
        }


        // checking the new owner of the freshly minted NFT tokenId 1 using the getter function ownerOf()
        let owner = await NFT.ownerOf(1);

        // asserting address1 is actually the owner of the NFT tokenId 1
        assert.equal(owner,address1,"NFT tokenId 1 has not been succesfully minted to address1");
        
        try{

            // approving the stakercontract for NFT tokenId1, currently held by address1, msgSender specification unnecessary
            await NFT.approve(StakerContract.address,1);
        }catch(error){
            console.log(error);
        }

        // using the getter function getApproved() to get the approved address for NFT tokenId 1,
        // which should now return the address of the staker contract
        let approved = await NFT.getApproved(1);

        // asserting the returned address is actually the address of the stakercontract
        assert.equal(approved,StakerContract.address,"getApproved(1) did not return the address of the stakercontract") 
    });


    // staking the NFT tokenId 1  and asserting it is then owned by the stakingcontract
    it("should stake the 1st nft, then check it is actually owned by the staking contract",async()=>{
        
        // making sure address1 has yet no NFTs staked by using the getterfunction stakedAmount()
        let stakedAmount = await StakerContract.stakedAmount(address1);

        // asserting the stakedAmount of address1 is currently 0
        assert.equal(stakedAmount,0,"stakedAmount of address1 is appearently not 0");

        try{

            // staking the NFT tokenId 1, currently held by address1,
            // which also has to be the msgSender (reverting if transaction is initiaized by an approed spender),
            // otherwise triggering the require statement "Only Owner of NFT can stake" of the stake() function
            await StakerContract.stake(1)
        }catch(error){
            console.log(error)
        }

        // once again using the getter function stakedAmount() to get the amount of NFTs staked by address1,
        // which should now return 1 , and the ownerOf() function to get the current owner of NFT tokenId 1,
        // which should now be held by the staking contract
        stakedAmount = await StakerContract.stakedAmount(address1)
        let owner = await NFT.ownerOf(1);

        // asserting the ownerOf(1) and stakedAmount(address1) did return the expected values
        assert.equal(owner,StakerContract.address,"ownerOf(1) did not return the address of the stakercontract");
        assert.equal(stakedAmount,1,"stakedAmount(address1) did not return 1")
    });

    
    // testing the claim function by claiming address1 rewards, who has recently staked NFT tokenId 1,
    // then checking the reward got paid
    it("will use the claim function to claim address1 rewards",async()=>{
    
        // checking the current totalSupply by using the getter function totalSuppl() of the reward token,
        // which should return 0, as no tokens have been minted yet, and no reward has been paid
        let ts1 = await StakerContract.totalSupply();

        // asserting the totalSupply() actually returned 0
        assert.equal(ts1,0,"totalSUpply() did not return 0, have some tokens already been minted or claimed?");
        
        // claiming the rewards of address1, rewards are only claimable by the receiving address (msgSender = receiver),
        // specification of msgSender unnecessary (address1 by default)
        try{
            await StakerContract.claim(address1);
        }catch(error){
            console.log(error);
        }

        // checking a reward has been paid, thus increasing the totalSupply of the reward token
        let ts2 = await StakerContract.totalSupply();
        
        

        // asserting the totalSupply is now greater than zero
        assert.notEqual(ts2.words[0] ,0,"totalSupply() after claiming returned no value greater than zero");

        // checking the reward got paid to address1 by using the getter function balanceOf()
        let balance = await StakerContract.balanceOf(address1);
        // asserting the balance of address1 is greater than zero
        assert.notEqual(balance.words[0],0,"balanceOf(address1) returned no value greater than zero");


    })


    // minting and staking another NFT by the same address1, then checking its stakedAmount did increase
    it("will mint a 2nd NFT to adress1, then stake that aswell",async()=>{


        // minting the second NFT tokenId 2 to address1, restricted access for NFT contract owner (address1),
        // msgSender specification unnecessary
        try{
            await NFT.mint(address1,2);
        }catch(error){
            console.log(error);
        }

        // approve the stakingcontract for the NFt tokenId 2,
        // currently held by address1 = msgSender, which is necessary for the stake() function later
        try{
            await NFT.approve(StakerContract.address,2);

            // asserting the StakingContract got approved for NFT tokenId 2 by using the getter function getApproved()
            let approved = await NFT.getApproved(2);
            assert.equal(approved,StakerContract.address,"approved address for NFT tokenId 2 did not return StakerContract.address");
        }catch(error){
            console.log(error)
        }

        // staking NFT tokenId 2 from address1 (msgSender specification unnecessary)
        try{
            await StakerContract.stake(2);
        }catch(error){
            console.log(error)
        }

        // using the getter function stakedAmount() to chekck the amount of NFTs staked by address1
        let stakedAmount = await StakerContract.stakedAmount(address1);

        // asserting stakedAmount(address1) returned 2
        assert.equal(stakedAmount,2,"stakedAmount(address1) did not return 2")
        

        // asserting NFT tokenId 2 is now owned by the Stakingcontract by using the 
        // getter function ownerOf(2) to return the current owner 
        assert.equal(await NFT.ownerOf(2),StakerContract.address);  
    })

    // checking a transaction trying ot stake an alredy staked NFT revert.
    // This transaction triggers several require() statements, the first necessity being
    // msgSender = NFTcontract.ownerOf(tokenId), which is not the case for an already staked NFT
    it("should fail when one tries to stake an already staked NFT",async()=>{
        try{
            // trying to stake the already staked NFT token
            await StakerContract.stake(2)
        }catch(error){
            // the above stake() fcuntion call should fail, triggering the the require statement msgSender = ownerOf(2)
            // asserting it actually triggered the statement, thus reverting the transcation, then returning
            assert.include(error.message,"Only owner of NFT can Stake");
            return
        }

        // asserting false, this code should not get reached unless the transaction did not revert, thus failing the unit test
        assert(false);
        
    })


    // testing the transaction reverts if not the address that staked the NFT tries to unstake it
    // the Stakercontract keeps track of which tokenId is staked by which address in a private mapping,
    // and requires that this address = msgSender in an unstake() function call,
    // as the unstake function attempts to return the NFT to the msgSender
    it("should fail when not the staker of the NFT tries to unstake it",async()=>{
        try{
            // specifying address7 = msgSender, then trying to unstake NFT tokenId 2,
            // which has been staked by address1, thus the transaction should fail,
            await StakerContract.unstake(2,{from: address7});
        }catch(error){
            // asserting the transaction did fail, triggering the require() statement "only Staker can unstake NFT", then returning
            assert.include(error.message,"only Staker can unstake NFT");
            return
        }

        // asserting false, this code should not get reached unless the transaction did not revert, thus failing the unit test
        assert(false);
    })

    // testing the transaction reverts if an eligible claimer tries to claim the rewards to an address other then itself,
    // preventing claims to smart contracts which are unable to interact with the ERC20 contract, therefor getting the tokens stuck
    it("should fail when not the owner tries to claim rewards to another address then himself",async()=>{

        
        try{

            // address2 (currently has no NFT staked) trying to claim rewards to address7,
            // should fail bot reuiqre statements of the claim function, the first being (msgSender = receiver || msgSender == _owner)
            await StakerContract.claim(address7,{from:address2});
        }catch(error){

            // asserting the transaction did fail as it triggered the frist require statement, then returning
            assert.include(error.message,"only staker of NFT can claim his rewards","");
            return;
        }

        // asserting false, this code should not get reached unless the transaction did not revert, thus failing the unit test
        assert(false);
    })


    // testing the transaction reverts when one tries to unstake a not staked NFT tokenId,
    // this fails multiple unstake() logics, the first requirement being (_tokenStakedBy[tokenId] = msgSender),
    // the _tokenStakedBy for an unstaked NFT is the zero address
    it("should fail when one tries to unstake a not staked NFT",async()=>{
        try{

            // trying to unstake NFT tokenId 7, which is currently not staked nor existing
            await StakerContract.unstake(7);
        }catch(error){

            // asserting the transaction did fail when running into the above mentioned require statement, then returning
            assert.include(error.message,"only Staker can unstake NFT","transaction did not trigger the necessary require statement");
            return;
        }

        // asserting false, this code should not get reached unless the transaction did not revert, thus failing the unit test
        assert(false);
    })

    // testing to unstake an NFT tokenId, which should claim the stakers reward, adjust its stakedAMount and stakedFromTimesamp,
    // and return the NFT tokenId to its staker
    it("should unstake the 2nd NFT, thus returning it to address1",async()=>{


        // wasting time to increase the claimable reward for the staker
        await new Promise(resolve => setTimeout(resolve, 2000));
        await web3.eth.sendTransaction({to:address2, from: address1, value: web3.utils.toWei(`3`,`ether`)});
        await web3.eth.sendTransaction({to:address1, from: address2, value: web3.utils.toWei(`3`,`ether`)});


        // using getter function totalSupply() to get the supply of the ERC20 token paid as reward before the unstaking
        let ts1 = await StakerContract.totalSupply();
        

        // unstaking NFT tokenId2 which has been staked by address1, specifying msgSender = address1 is unnecessary
        try{
            await StakerContract.unstake(2);
        }catch(error){
            console.log(error)
        }

        // checking after the unstaking, NFT tokenId 2 is owned by address1 
        let owner = await NFT.ownerOf(2);
        assert.equal(owner,address1,"ownership of tokenId 2 has not been transferred back to address1");
        
        // checking the toalSupply after the usntaking by using the getterfunction totalSupply()
        let ts2 = await StakerContract.totalSupply();

        // asserting the totalSUpply did increase after the unstaking by concatinating
        // the the stringified values of the bigNumber objects
        assert((Number(ts2.words[0].toString() + ts2.words[1].toString())) > (Number(ts1.words[0].toString() + ts1.words[1].toString())));

        
    })


    // testing the getterfunctions for the private mappings and variables
    it("test the stakedSince, stakedAmount, tokenStakedBy, unclaimedRewards and getRewardRate function",async()=>{
        

        // wasting time, stakedsince calculates the amount of time using block.timestamp - _stakedFromTimestamp[address],
        // which is also set to a block.timestamp,
        // so we need to force ganache to produce new blocks (automining enabled), as view functions (getter functions = view functions)
        // wont lead to a new block, thus the difference will be 0, which will also lead to an unclaimedReward = 0
        await new Promise(resolve => setTimeout(resolve, 2000));
        await web3.eth.sendTransaction({to:address2, from: address1, value: web3.utils.toWei(`3`,`ether`)});
        await web3.eth.sendTransaction({to:address1, from: address2, value: web3.utils.toWei(`3`,`ether`)});


        // using the getter function for stakedAmount(address1), the current rewardRate(), tokenStakedBy(1) and the unclaimedRewards(adress1)
        let stakedAmount = await StakerContract.stakedAmount(address1);
        let rewardRate = await StakerContract.getRewardRate();
        let stakedBy = await StakerContract.tokenStakedBy(1);
        let unclaimedRewards = await StakerContract.unclaimedRewards(address1);


        // asserting the getter functions did return the expected values
        assert.notEqual(unclaimedRewards.words[0],0,"unclaimedRewards(address1) did not return a vlaue grater then zero");
        assert.equal(stakedAmount,1,"stakedAmount(address1) did not return 1");
        assert.equal(rewardRate,5000,"rewardRate() did not return 5000") //adjust if changed at contract construction
        assert.equal(stakedBy,address1,"stakedBy(1) did not return address1");
        
        
    })


    // testing the setRewardRate() function which modiefies the amount of tokens per second per NFT staked 
    // paid as reward, then using the getter function getRewardRate() to verify the modification
    // restricted access only for the owner (currently address1)
    it("will set a new reward rate, then check it and change it back to 5000",async()=>{
        
        // getting the current rewardRate, which should be 5000
        let rewardRate = await StakerContract.getRewardRate();
        assert.equal(rewardRate,5000,"current rewardRate did not return 5000, has the constructor argument changed?");

        // setting a new rewardRate, specifying address1 = msgSender unnecessary
        try{
            await StakerContract.setRewardRate(3000);
        }catch(error){
            console.log(error);
        }

        // checking the new rewardRate() and asserting it is now 3000
        rewardRate = await StakerContract.getRewardRate();
        assert.equal(rewardRate,3000,"getRewardRate() did not return 3000");

        // changing the rewardRate back to 5000, specifications for msgSender once again unnecessary
        try{
            await StakerContract.setRewardRate(5000,{from: address1});
        }catch(error){
            console.log(error);
        }

        // asserting the rewardRate got set back to 5000
        rewardRate = await StakerContract.getRewardRate();
        assert(rewardRate == 5000);
    })

})


