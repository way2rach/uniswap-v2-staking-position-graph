import {RewardAdded, RewardPaid, Withdrawn, Staked, StakingRewards} from "./types/StakingRewards0/StakingRewards";
import {User, Pool, MiningPool, MiningPosition} from "./types/schema";
import {BigInt, BigDecimal, Value} from '@graphprotocol/graph-ts/index';
import { Pair } from './types/StakingRewards0/Pair';
import { fetchTokenSymbol } from './helpers';


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
        let rewardRatePerSec = stakingContract.rewardRate();
        // TODO:make reward rate work, currently shown as zero
        miningPool.rewardRate = rewardRatePerSec;
        miningPool.totalStaked = BigInt.fromI32(0);

        let stakingToken = stakingContract.stakingToken();
        let pool = Pool.load(stakingToken.toHexString());
        if (pool === null) {
            pool = new Pool(stakingToken.toHexString());
            let pairContract = Pair.bind(stakingToken);
            let token0 = pairContract.token0();
            let token1 = pairContract.token1();
            pool.token0 = fetchTokenSymbol(token0);
            pool.token1 = fetchTokenSymbol(token1);
            pool.save();
        }
        miningPool.pair = pool.id;
    }

    miningPool.totalStaked = miningPool.totalStaked.plus(event.params.amount);

    miningPool.save();

    let miningPositionId = event.params.user.toHexString().concat('-').concat(event.address.toHexString());

    let miningPosition = MiningPosition.load(miningPositionId);

    if (miningPosition === null) {
        miningPosition = new MiningPosition(miningPositionId);
        miningPosition.user = user.id;
        miningPosition.miningPool = miningPool.id;
        miningPosition.balance = BigDecimal.fromString('0');
        miningPosition.claimedUni = BigInt.fromI32(0);
    }
    let amount = event.params.amount.divDecimal(BigDecimal.fromString('1000000000000000000'))
    miningPosition.balance = miningPosition.balance.plus(amount);
    miningPosition.save();
}

export function handleRewardAdded(event: RewardAdded): void {

}

export function handleRewardPaid(event: RewardPaid): void {
    let miningPositionId = event.params.user.toHexString().concat('-').concat(event.address.toHexString());
    let miningPosition = MiningPosition.load(miningPositionId);

    miningPosition.claimedUni = miningPosition.claimedUni.plus(event.params.reward);

    miningPosition.save();
}


export function handleWithdrawn(event: Withdrawn): void {

    let miningPositionId = event.params.user.toHexString().concat('-').concat(event.address.toHexString());
    let miningPosition = MiningPosition.load(miningPositionId);
    let miningPool = MiningPool.load(event.address.toHexString());

    let amount = event.params.amount.divDecimal(BigDecimal.fromString('1000000000000000000'))
    miningPool.totalStaked = miningPool.totalStaked.minus(BigInt.fromI32(amount as i32));
    miningPosition.balance = miningPosition.balance.minus(amount);
    miningPosition.save();
    miningPool.save();
}

