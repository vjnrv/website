import { DialogContent, DialogOverlay } from '@reach/dialog';
import '@reach/dialog/styles.css';
import Fuse from 'fuse.js';
import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Button } from 'ts/components/button';
import { Icon } from 'ts/components/icon';
import { Input } from 'ts/components/modals/input';
import { Thumbnail } from 'ts/components/staking/thumbnail.tsx';
import { Heading, Paragraph } from 'ts/components/text';

import { zIndex } from 'ts/style/z_index';
import { PoolWithStats } from 'ts/types';
import { colors } from 'ts/utils/colors';
import { stakingUtils } from 'ts/utils/staking_utils';

interface ChangePoolDialogProps {
    isOpen: boolean;
    onDismiss: () => void;
    stakingPools: PoolWithStats[];
    currentPoolDetails?: {
        poolId: string;
        zrxAmount: number;
    };
    moveStake: (fromPoolId: string, toPoolId: string, zrxAmount: number, callback?: () => void) => void;
}

interface PoolWithDisplayName extends PoolWithStats {
    displayName: string;
}

export const ChangePoolDialog: FC<ChangePoolDialogProps> = ({
    isOpen,
    onDismiss,
    stakingPools,
    moveStake,
    currentPoolDetails = {},
}) => {
    const { poolId: fromPoolId, zrxAmount } = currentPoolDetails;

    const [search, setSearch] = useState<string>('');
    const [poolsList, setPoolsList] = useState<PoolWithStats[]>([]);
    const [fuse, setFuse] = useState<Fuse<PoolWithDisplayName, { keys: string[] }> | undefined>(undefined);
    useEffect(() => {
        if (!stakingPools.length) {
            return;
        }

        setFuse(
            new Fuse(
                stakingPools.map(pool => ({ ...pool, displayName: stakingUtils.getPoolDisplayName(pool) })),
                { keys: ['displayName'] },
            ),
        );
    }, [stakingPools]);

    useEffect(() => {
        if (!fuse) {
            return;
        }

        const results = fuse.search<PoolWithStats>(search);
        setPoolsList(results);
    }, [fuse, search]);

    return (
        <StyledDialogOverlay isOpen={isOpen}>
            <StyledDialogContent>
                <ButtonClose isTransparent={true} isNoBorder={true} padding="0px" onClick={onDismiss}>
                    <Icon name="close-modal" />
                </ButtonClose>
                <StyledHeading as="h3">Select a new pool</StyledHeading>
                <StyledParagraph>Choose a new liquidity pool from the list to move your stake.</StyledParagraph>

                <InputWrapper>
                    <Icon name="search" size={18} color="#5C5C5C" />
                    <StyledInput width="full" placeholder="Search Pools" onChange={e => setSearch(e.target.value)} />
                </InputWrapper>

                <PoolsListWrapper>
                    {(poolsList.length ? poolsList : stakingPools).map(pool => (
                        <Pool key={pool.poolId} onClick={() => moveStake(fromPoolId, pool.poolId, zrxAmount)}>
                            <StyledThumbnail
                                size={40}
                                thumbnailUrl={pool.metaData.logoUrl}
                                poolId={pool.poolId}
                                address={pool.operatorAddress}
                            />
                            {stakingUtils.getPoolDisplayName(pool)}
                        </Pool>
                    ))}
                </PoolsListWrapper>
            </StyledDialogContent>
        </StyledDialogOverlay>
    );
};

const StyledParagraph = styled(Paragraph)`
    font-style: normal;
    font-weight: 300;
    font-size: 18px;
    line-height: 26px;
`;

const StyledHeading = styled(Heading)`
    font-size: 34px;
    line-height: 42px;
    margin-bottom: 20px;

    font-feature-settings: 'tnum' on, 'lnum' on;
`;

const StyledInput = styled(Input)`
    input {
        ::placeholder {
            color: ${props => props.theme.textDarkSecondary};
        }

        background-color: ${props => props.theme.lightBgColor};
        border: none;
    }
`;

const InputWrapper = styled.div`
    display: flex;
    align-items: center;

    box-shadow: 0px 1px 0px #b4bebd;
    margin-bottom: 23px;
`;

const PoolsListWrapper = styled.div`
    height: 450px;
    overflow-y: scroll;
`;

const ButtonClose = styled(Button)`
    width: 18px;
    height: 18px;
    border: none;
    position: absolute;
    right: -10px;
    top: -30px;

    path {
        fill: ${colors.black};
    }
`;

const Pool = styled.div`
    height: 87px;
    background: #fff;
    border: 1px solid #ddd;
    display: flex;
    flex-direction: row;
    align-items: center;

    & + & {
        margin-top: 14px;
    }
`;

const StyledDialogOverlay = styled(DialogOverlay)`
    &[data-reach-dialog-overlay] {
        background-color: rgba(255, 255, 255, 0.8);
        z-index: ${zIndex.overlay};

        @media (max-width: 768px) {
            background: white;
        }
    }
`;

const StyledDialogContent = styled(DialogContent)`
    &[data-reach-dialog-content] {
        position: relative;
        width: 600px;
        background: ${props => props.theme.lightBgColor};
        border: 1px solid #e5e5e5;

        @media (max-width: 768px) {
            height: 100vh;
            width: 100vw;
            margin: 0;
            padding: 30px;

            border: none;
        }
    }
`;

const StyledThumbnail = styled(Thumbnail)`
    margin 0 20px;
`;
