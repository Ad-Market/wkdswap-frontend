import {  Button, CardBody, CardProps, Input } from '@pancakeswap/uikit'
import {  useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { DeserializedPool, VaultKey, DeserializedLockedCakeVault, DeserializedCakeVault } from 'state/types'
import styled from 'styled-components'

import { StyledCard } from '../PoolCard/StyledCard'
import { ApprovalState, useWkdCommit } from 'views/Pools/hooks/useWkdCommit'
// import { useApproveWkdCallback } from 'hooks/useApproveCallback'
import { parseUnits } from '@ethersproject/units'
import bsc from '../../../../config/constants/contracts'
import useToast from 'hooks/useToast'
import { useApproveCallback } from 'hooks/useApproveCallback'
import { useCurrency } from 'hooks/Tokens'
import tryParseAmount from 'utils/tryParseAmount'
import { WKD_TESTNET2 } from '../../../../config/constants/tokens'
import ifoActive from "../../../../config/constants/ifo"

const StyledCardBody = styled(CardBody)<{ isLoading: boolean }>`
  min-height: ${({ isLoading }) => (isLoading ? '0' : '254px')};
`

interface CakeVaultProps extends CardProps {
  pool: DeserializedPool
  showStakedOnly: boolean
  defaultFooterExpanded?: boolean
  showICake?: boolean
}

interface CakeVaultDetailProps {
  isLoading?: boolean
  account: string
  pool: DeserializedPool
  vaultPool: DeserializedCakeVault
  accountHasSharesStaked: boolean
  defaultFooterExpanded?: boolean
  showICake?: boolean
  performanceFeeAsDecimal: number
}

// export const CakeVaultDetail: React.FC<CakeVaultDetailProps> = ({
//   isLoading = false,
//   account,
//   pool,
//   vaultPool,
//   accountHasSharesStaked,
//   showICake,
//   performanceFeeAsDecimal,
//   defaultFooterExpanded,
// }) => {
//   const { t } = useTranslation()

//   return (
//     <>
//       <StyledCardBody isLoading={isLoading}>
//         {account && pool.vaultKey === VaultKey.CakeVault && (
//           <VaultPositionTagWithLabel userData={(vaultPool as DeserializedLockedCakeVault).userData} />
//         )}
//         {account &&
//         pool.vaultKey === VaultKey.CakeVault &&
//         (vaultPool as DeserializedLockedCakeVault).userData.locked ? (
//           <LockedStakingApy
//             userData={(vaultPool as DeserializedLockedCakeVault).userData}
//             stakingToken={pool?.stakingToken}
//             stakingTokenBalance={pool?.userData?.stakingTokenBalance}
//             showICake={showICake}
//           />
//         ) : (
//           <>
//             <StakingApy pool={pool} />
//             <FlexGap mt="16px" gap="24px" flexDirection={accountHasSharesStaked ? 'column-reverse' : 'column'}>
//               <Box>
//                 {account && (
//                   <Box mb="8px">
//                     <UnstakingFeeCountdownRow vaultKey={pool.vaultKey} />
//                   </Box>
//                 )}
//                 <RecentCakeProfitRow pool={pool} />
//               </Box>
//               <Flex flexDirection="column">
//                 {account ? (
//                   <VaultCardActions
//                     pool={pool}
//                     accountHasSharesStaked={accountHasSharesStaked}
//                     isLoading={isLoading}
//                     performanceFee={performanceFeeAsDecimal}
//                   />
//                 ) : (
//                   <>
//                     <Text mb="10px" textTransform="uppercase" fontSize="12px" color="textSubtle" bold>
//                       {t('Start earning')}
//                     </Text>
//                     <ConnectWalletButton />
//                   </>
//                 )}
//               </Flex>
//             </FlexGap>
//           </>
//         )}
//       </StyledCardBody>
//       <CardFooter defaultExpanded={defaultFooterExpanded} pool={pool} account={account} />
//     </>
//   )
// }

// const CakeVaultCard: React.FC<CakeVaultProps> = ({
//   pool,
//   showStakedOnly,
//   defaultFooterExpanded,
//   showICake = false,
//   ...props
// }) => {
// const { account } = useWeb3React()

//   const vaultPool = useVaultPoolByKey(pool.vaultKey)

//   const {
//     userData: { userShares, isLoading: isVaultUserDataLoading },
//     fees: { performanceFeeAsDecimal },
//   } = vaultPool

//   const accountHasSharesStaked = userShares && userShares.gt(0)
//   const isLoading = !pool.userData || isVaultUserDataLoading

//   if (showStakedOnly && !accountHasSharesStaked) {
//     return null
//   }

//   return (
//     <StyledCard isActive {...props}>
//       <PoolCardHeader isStaking={accountHasSharesStaked}>
//         <PoolCardHeaderTitle
//           title={vaultPoolConfig[pool.vaultKey].name}
//           subTitle={vaultPoolConfig[pool.vaultKey].description}
//         />
//         <TokenPairImage {...vaultPoolConfig[pool.vaultKey].tokenImage} width={64} height={64} />
//       </PoolCardHeader>
//       <CakeVaultDetail
//         isLoading={isLoading}
//         account={account}
//         pool={pool}
//         vaultPool={vaultPool}
//         accountHasSharesStaked={accountHasSharesStaked}
//         showICake={showICake}
//         performanceFeeAsDecimal={performanceFeeAsDecimal}
//         defaultFooterExpanded={defaultFooterExpanded}
//       />
//     </StyledCard>
//   )
// }

// export default CakeVaultCard

const CommitTokenCard = () => {
  const [amount, setAmount] = useState(0)
  const { account } = useWeb3React()
  let { commit } = useWkdCommit()
  let { toastError, toastSuccess } = useToast()
  const [committing, setCommitting] = useState(false)

  const amountChangeHandler = (event) => {
    setAmount(() => {
      return !!event.target.value ? event.target.value : '0'
    })
  }
  const activeIfo = ifoActive.find((ifo)=> ifo.isActive)

  const token = useCurrency(WKD_TESTNET2?.address)
  const parsed = tryParseAmount(amount.toString(), token)
  const commitAmount = parseUnits(amount.toString(), 9)
  const [approvalCommit, approve] = useApproveCallback(parsed, bsc.wkdCommit[56])

  const commitTokenHandler = async () => {
    if (!amount) toastError('field cannot be empty')
    setCommitting(true)
    try {
      await commit(commitAmount, async (res: any) => {
        if (!res.hash) {
          setCommitting(false)
          toastError(res.message)
        }
        await res.wait()
        setCommitting(false)
        toastSuccess(`You have successfully committed ${commitAmount} wkd`)
      })
    } catch (error) {
      console.log(error)
      setCommitting(false)
    }
  }

  return (
    <StyledCard>
      <StyledCardBody isLoading={false}>
        <h1>Commit Wakanda</h1>
        {account ? (
          <>
            <Input onChange={amountChangeHandler} style={{ marginTop: '3rem' }} type="number" />
            {approvalCommit === ApprovalState.NOT_APPROVED || approvalCommit === ApprovalState.PENDING ? (
              <Button style={{ marginTop: '3rem' }} onClick={approve}>
                {approvalCommit === ApprovalState.PENDING ? 'Approving' : 'Approve'}
              </Button>
            ) : (
              <Button onClick={commitTokenHandler} disabled={ !activeIfo?.isActive || committing === true} style={{ marginTop: '3rem' }}>
                Commit Wkd
              </Button>
            )}
          </>
        ) : null}

        {!account && <ConnectWalletButton style={{ marginTop: '9rem', width: '100%' }} />}
      </StyledCardBody>
    </StyledCard>
  )
}

export default CommitTokenCard
