type ProposalListHeaderProps = {
  stakedVotes: string | number
}

export const ProposalListHeader = (props: ProposalListHeaderProps) => {
  const { stakedVotes } = props;
  return (
    <div className="flex flex-col items-center justify-between w-full gap-6 lg:flex-row">
      <h2 className="text-4xl font-semibold dark:text-white">Proposals</h2>
      <div className="flex flex-col items-center w-full space-y-4 lg:space-y-0 lg:space-x-3 lg:divide-x lg:flex-row">
        <div className="flex justify-center w-full lg:items-end lg:flex-col">
          <span className="text-base font-medium text-black dark:text-white">Your total staked votes:</span>
          <span className="ml-1 text-base font-semibold text-blue-500">
            {stakedVotes}
            <span className="text-xs font-light">COMAI</span>
          </span>
        </div>

        <div className="flex flex-row-reverse justify-center w-full gap-4 lg:gap-0 lg:flex-row lg:pl-3 lg:w-auto">
          <input className="w-8/12 px-4 py-2 bg-white border-2 border-black lg:mr-3 lg:w-auto dark:border-white dark:bg-light-dark dark:text-white rounded-xl dark:shadow-custom-dark shadow-custom dark:placeholder:text-white placeholder:text-black" placeholder="Search"></input>
          <button className="w-4/12 px-4 border-2 border-black lg:w-auto dark:border-white dark:bg-light-dark rounded-xl dark:text-white dark:shadow-custom-dark shadow-custom">Filter</button>
        </div>

        <div className="flex w-full lg:pl-3 lg:w-auto min-w-max">
          <button className="w-full px-4 py-2 text-blue-500 border-2 border-blue-500 lg:w-auto min-w-auto rounded-xl dark:bg-light-dark shadow-custom-blue">New proposal</button>
        </div>
      </div>
    </div>
  )
}

