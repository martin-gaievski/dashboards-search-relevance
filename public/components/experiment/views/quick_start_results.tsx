/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiPanel,
  EuiCallOut,
  EuiText,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiStat,
  EuiButton,
  EuiButtonEmpty,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiCopy,
  EuiIcon,
  EuiAccordion,
} from '@elastic/eui';

interface QuickStartResultsProps {
  indexName: string;
  numQueriesGenerated: number;
  numConfigsTested: number;
  durationMinutes: number;
  llmModel: string;
  recommendedConfig: {
    technique: string;
    bm25Weight: number;
    vectorWeight: number;
    normalization: string;
    ndcg: number;
    ndcgImprovement: number;
    mrr: number;
    mrrImprovement: number;
    precision: number;
    precisionImprovement: number;
  };
  generatedResources: {
    querySetId: string;
    querySetName: string;
    judgmentId: string;
    judgmentName: string;
    numRatings: number;
    avgRating: number;
  };
  onTestConfiguration: () => void;
  onRunNewOptimization: () => void;
  onSwitchToAdvanced: () => void;
  onViewQueries: () => void;
  onViewRatings: () => void;
  onDeploy: () => void;
}

export const QuickStartResults: React.FC<QuickStartResultsProps> = ({
  indexName,
  numQueriesGenerated,
  numConfigsTested,
  durationMinutes,
  llmModel,
  recommendedConfig,
  generatedResources,
  onTestConfiguration,
  onRunNewOptimization,
  onSwitchToAdvanced,
  onViewQueries,
  onViewRatings,
  onDeploy,
}) => {
  const apiRequest = `{
  "query": {
    "hybrid": {
      "queries": [
        { "match": { "title": "{{query}}" } },
        { "neural": { "title_vector": { "query_text": "{{query}}" } } }
      ],
      "weights": [${recommendedConfig.bm25Weight}, ${recommendedConfig.vectorWeight}],
      "technique": "${recommendedConfig.technique.toLowerCase()}"
    }
  }
}`;

  return (
    <>
      {/* Success Summary */}
      <EuiCallOut
        title="Optimization Complete"
        color="success"
        iconType="check"
      >
        <EuiText size="s">
          <p>
            Successfully optimized hybrid search for <strong>{indexName}</strong>
          </p>
          <p>
            Generated {numQueriesGenerated} test queries and ratings using {llmModel} • 
            Tested {numConfigsTested} configurations • 
            Duration: {durationMinutes} minutes
          </p>
        </EuiText>
      </EuiCallOut>

      <EuiSpacer size="l" />

      {/* Recommended Configuration */}
      <EuiPanel hasBorder paddingSize="l" color="primary">
        <EuiFlexGroup direction="column" gutterSize="m">
          <EuiFlexItem>
            <EuiText>
              <h3>Recommended Configuration</h3>
            </EuiText>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiFlexGroup gutterSize="l">
              <EuiFlexItem>
                <EuiStat
                  title={`${recommendedConfig.technique}`}
                  description="Techniques"
                  titleColor="success"
                  textAlign="center"
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiStat
                  title={recommendedConfig.bm25Weight.toString()}
                  description="BM25 Weight"
                  titleColor="success"
                  textAlign="center"
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiStat
                  title={recommendedConfig.vectorWeight.toString()}
                  description="Vector Weight"
                  titleColor="success"
                  textAlign="center"
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiAccordion
              id="performanceMetrics"
              buttonContent={
                <EuiText size="s">
                  <strong>Performance Metrics</strong>
                </EuiText>
              }
              paddingSize="m"
            >
              <EuiFlexGroup gutterSize="l">
                <EuiFlexItem>
                  <EuiStat
                    title={recommendedConfig.ndcg.toFixed(3)}
                    description="NDCG@10"
                    titleColor="success"
                    textAlign="center"
                  />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiStat
                    title={recommendedConfig.mrr.toFixed(3)}
                    description="MRR"
                    titleColor="success"
                    textAlign="center"
                  />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiStat
                    title={recommendedConfig.precision.toFixed(2)}
                    description="Precision@5"
                    titleColor="success"
                    textAlign="center"
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiAccordion>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiFlexGroup gutterSize="s" justifyContent="center">
              <EuiFlexItem grow={false}>
                <EuiCopy textToCopy={apiRequest}>
                  {(copy) => (
                    <EuiButton
                      onClick={copy}
                      iconType="copyClipboard"
                      size="s"
                    >
                      Copy API Request
                    </EuiButton>
                  )}
                </EuiCopy>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={onDeploy}
                  iconType="launch"
                  fill
                  size="s"
                  color="primary"
                >
                  Deploy to Index
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={onTestConfiguration}
                  iconType="beaker"
                  size="s"
                >
                  Test Configuration
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={onRunNewOptimization}
                  iconType="refresh"
                  size="s"
                >
                  Run New Optimization
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </>
  );
};
