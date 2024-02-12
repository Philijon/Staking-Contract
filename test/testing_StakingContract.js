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

        NFT = await ERC721Enumerable.deployed();
        // Staker = await stakingContract.deployed();
        StakerContract = await stakingContract.new(NFT.address,"RewardToken","RWT",5000);
        // console.log(NFT.address,Staker.address,StakerContract.address)
    });

        
    it("should return the address of the deployed staking contract",async()=>{
        assert(StakerContract.address != "");
    });

    it("will test the implementation of the erc721 onERC721Received functionality of the contract, which should return the onERC721Received selector",async()=>{
        // selector = 0x150b7a02
        let result;
        try{
            result = await StakerContract.onERC721Received(address1,address2,1,"0x00");
            // console.log(result)
        }catch(error){
            console.log(error);
        }
        assert(result = 0x150b7a02)
    });

    it("should give the staking contract approval to transfer nft 1 from address1",async()=>{
        
        //mint NFT1
        try{
            await NFT.mint(address1,1,{from: address1})
        }catch(error){
            console.log(error)
        }


        let owner = await NFT.ownerOf(1);
        assert(owner = address1);
        
        try{
            await NFT.approve(StakerContract.address,1,{from: address1});
        }catch(error){
            console.log(error);
        }

        let approved = await NFT.getApproved(1);
        assert(approved==StakerContract.address)

        
        
    });

    it("should stake the 1st nft, then check it is actually owned by the staking contract",async()=>{
        let stakedAmount = await StakerContract.stakedAmount(address1);
        assert(stakedAmount==0);

        try{
            await StakerContract.stake(1)
        }catch(error){
            console.log(error)
        }


        let owner = await NFT.ownerOf(1);
        assert(owner == StakerContract.address);
    });

    

    it("will use the claim function to claim address1 rewards",async()=>{

        let time = await StakerContract.stakedtime(address1);
        let ts1 = await StakerContract.totalSupply();

        assert(ts1 == 0);
        assert(time >0);
        
        try{
            await StakerContract.claim(address1);
        }catch(error){
            console.log(error);
        }

        let ts2 = await StakerContract.totalSupply();
        assert(ts2 >0);

        let balance = await StakerContract.balanceOf(address1);
        assert(balance > 0);


    })

    it("will mint a 2nd NFT to adress1, then stake that aswell",async()=>{


        // mint the 2nd NFT
        try{
            await NFT.mint(address1,2,{from:address1});
        }catch(error){
            console.log(error);
        }

        // approve the stakingcontract for the 2nd NFT
        try{
            await NFT.approve(StakerContract.address,2,{from: address1});
            let approved = await NFT.getApproved(2);
            assert(approved == StakerContract.address);
        }catch(error){
            console.log(error)
        }

        // stake the 2nd NFT
        
        try{
            
            await StakerContract.stake(2);
        }catch(error){
            console.log(error)
        }
        

        assert(await NFT.ownerOf(2) == StakerContract.address);

        
    })

    it("should fail when one tries to stake an already staked NFT",async()=>{
        try{
            await StakerContract.stake(2)
        }catch(error){
            assert(error.message.includes("Only owner of NFT can Stake"));
            return
        }

        assert(false);
        
    })

    it("should fail when not the staker of the NFT tries to unstake it",async()=>{
        try{
            await StakerContract.unstake(2,{from: address7});
        }catch(error){
            assert(error.message.includes("only Staker can unstake NFT"));
            return
        }
        assert(false);
    })

    it("should fail when one tries to claim to an address that does not stake an NFT",async()=>{

        
        try{
            await StakerContract.claim(address7,{from:address1});
        }catch(error){
            assert(error.message.includes("Claimer address has no NFT staked"));
            return;
        }
        assert(false);
    })

    it("should fail when one tries to unstake a not staked NFT",async()=>{
        try{
            await StakerContract.unstake(7);
        }catch(error){
            assert(error.message.includes("only Staker can unstake NFT"));
            return;
        }
        assert(false);
    })

    it("should unstake the 2nd NFT, thus returning it to address1",async()=>{

        let ts1 = await StakerContract.totalSupply();
        
        try{
            await StakerContract.unstake(2,{from:address1});
        }catch(error){
            console.log(error)
        }

        let owner = await NFT.ownerOf(2);
        assert(owner == address1);
        let ts2 = await StakerContract.totalSupply();
        assert(ts2>ts1);

        
    })

    // testing the getters

    it("test the stakedSince, stakedAmount, tokenStakedBy and getRewardRate function",async()=>{
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        await web3.eth.sendTransaction({to:address2, from: address1, value: web3.utils.toWei(`3`,`ether`)});
        await web3.eth.sendTransaction({to:address1, from: address2, value: web3.utils.toWei(`3`,`ether`)});

        let stakedAmount = await StakerContract.stakedAmount(address1);
        let rewardRate = await StakerContract.getRewardRate();
        let stakedBy = await StakerContract.tokenStakedBy(1);
        let unclaimedRewards = await StakerContract.unclaimedRewards(address1);

        let ts1 = await StakerContract.totalSupply();
        await StakerContract.claim(address1,{from: address1});
        let ts2 = await StakerContract.totalSupply();

        assert(ts2>ts1);
        assert(unclaimedRewards > 0);
        assert(stakedAmount == 1);
        assert(rewardRate == 5000) //adjust if changed at contract construction
        assert(stakedBy == address1);
        
        
    })

    it("should fail when not the staker of the NFT tries to claim the rewards",async()=>{
        try{
            await StakerContract.claim(address1,{from: address3})
        }catch(error){
            assert(error.message.includes("only owner of NFT can claim his rewards"));
            return;
        }

        assert(false);
    })

    it("will set a new reward rate, then check it and change it back to 5000",async()=>{
        let rewardRate = await StakerContract.getRewardRate();
        assert(rewardRate == 5000);

        try{
            await StakerContract.setRewardRate(3000,{from: address1});
        }catch(error){
            console.log(error);
        }

        rewardRate = await StakerContract.getRewardRate();
        assert(rewardRate == 3000);

        try{
            await StakerContract.setRewardRate(5000,{from: address1});
        }catch(error){
            console.log(error);
        }

        rewardRate = await StakerContract.getRewardRate();
        assert(rewardRate == 5000);
    })

})


