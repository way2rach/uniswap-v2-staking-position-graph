import {RewardAdded, RewardPaid, Withdrawn, Staked, StakingRewards} from "./types/StakingRewards/StakingRewards";
import {User, Pair, MiningPool, MiningPosition} from "./types/schema";
import {BigInt} from '@graphprotocol/graph-ts/index'

export function handleStaked(event: Staked): void {

    let user = User.load(event.params.user.toHexString());

    if (user === null) {
        user = new User(event.params.user.toHexString());
    }
    user.save();


    let miningPool = MiningPool.load(event.address.toHexString());

    if (miningPool === null) {
        miningPool = new MiningPool(event.address.toHexString());
        let stakingContract = StakingRewards.bind(event.address);
        let stakingToken = stakingContract.stakingToken();
        miningPool.stakingToken = stakingToken;
        let rewardRatePerSec = stakingContract.rewardRate();
        // TODO:make reward rate work, currently shown as zero
        miningPool.rewardRate = rewardRatePerSec;
        miningPool.totalStaked = BigInt.fromI32(0);
    }

    miningPool.totalStaked = miningPool.totalStaked.plus(event.params.amount);

    miningPool.save();

    let miningPositionId = event.params.user.toHexString().concat('-').concat(event.address.toHexString());

    let miningPosition = MiningPosition.load(miningPositionId);

    if (miningPosition === null) {
        miningPosition = new MiningPosition(miningPositionId);
        miningPosition.user = user.id;
        miningPosition.miningPool = miningPool.id;
        miningPosition.balance = BigInt.fromI32(0);
    }
    miningPosition.balance = miningPosition.balance.plus(event.params.amount);

    miningPosition.save();
}

export function handleRewardAdded(event: RewardAdded): void {
}

export function handleRewardPaid(event: RewardPaid): void {
}

export function handleWithdrawn(event: Withdrawn): void {
}

