export const proposalMockList = [
  {
    id: '1',
    active: true,
    voted: "FAVOR",
    title: '[ARFC] Risk Parameters for DAI Update',
    description: `This proposal aims to update the risk parameters for the DAI stablecoin across all Aave deployments. MakerDAO's recent aggressive actions with their D3M program have resulted in a significant increase in the "D3M" credit line for DAI, growing from 0 to predicted 600 million DAI within less than a month. With the potential extension of this credit line to 1 billion DAI in the near term, the unpredictability of future governance decisions by MakerDAO raises concerns regarding the inherent risk nature of DAI as collateral.`,
    startDate: 'Tue Apr 02 2024 13:53:58 GMT+1000 (Australian Eastern Standard Time)',
    endDate: 'Tue Apr 09 2024 00:53:58 GMT+1000 (Australian Eastern Standard Time)',
    by: 'xtg1724.lens',
    totalStake: '1107.45',
    proposalResult: 'PENDING',
    favorablePercentage: 50
  },
  {
    id: '2',
    active: false,
    voted: "AGAINST",
    title: '[ARFC] Onboard sUSDe to Aave V3 on Ethereum',
    description: `This is an ARFC to seek approval for the addition of sUSDe to Aave V3 on Ethereum, following the consensus reached in the TEMP As discussed in the TEMP CHECK, Ethena's synthetic dollar, USDe, provides a stable crypto-native solution for a cash and carry structured product. The staked version of USDe, sUSDe, earns yield from the protocol and has high potential for strong borrow demand.`,
    startDate: 'Tue Apr 09 2024 00:53:58 GMT+1000 (Australian Eastern Standard Time)',
    endDate: 'Tue Apr 02 2024 00:53:58 GMT+1000 (Australian Eastern Standard Time)',
    by: 'xtg1724.lens',
    totalStake: '5103.45',
    proposalResult: 'REFUSED',
    favorablePercentage: 28
  },
  {
    id: '3',
    active: false,
    voted: "UNVOTED",
    title: '[TEMP CHECK] Allez Labs risk provider proposal to Aave DAO',
    description: `Allez Labs, a team of longstanding Aave risk contributors, solicits community feedback for a 6-month engagement with Aave DAO. Our goal is to deliver continuous risk management and R&D to the DAO. We aim to maintain and improve Aave’s strong risk standards and support Aave’s growth and development with a risk conscious approach. Allez Labs is a team of data and risk experts with deep experience with Aave and its community since 2019. We have been involved in nearly all risk events that have affected the protocol.`,
    startDate: 'Tue Apr 09 2024 13:53:58 GMT+1000 (Australian Eastern Standard Time)',
    endDate: null,
    by: 'xtg1724.lens',
    totalStake: '4101.45',
    proposalResult: 'ACCEPTED',
    favorablePercentage: 90
  }
]

export type ProposalList = {
  id: string;
  active: boolean;
  voted: string;
  title: string;
  description: string;
  startDate: string;
  endDate: Date | null;
  by: string;
  totalStake: string;
  proposalResult: string;
  favorablePercentage: number;
}