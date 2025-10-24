/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CoreStart } from '../../../../../../src/core/public';
import { QuickStartResults } from './quick_start_results';

interface QuickStartMockResultsPageProps extends RouteComponentProps {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
}

const QuickStartMockResultsPage: React.FC<QuickStartMockResultsPageProps> = ({
  history,
  notifications,
}) => {
  const mockData = {
    indexName: 'my-product-index',
    numQueriesGenerated: 50,
    numConfigsTested: 20,
    durationMinutes: 18,
    llmModel: 'GPT-4',
    recommendedConfig: {
      technique: 'min_max/arithmetic_mean',
      bm25Weight: 0.35,
      vectorWeight: 0.65,
      normalization: 'min-max',
      ndcg: 0.847,
      ndcgImprovement: 12,
      mrr: 0.782,
      mrrImprovement: 8,
      precision: 0.91,
      precisionImprovement: 15,
    },
    generatedResources: {
      querySetId: 'auto-generated-queries-123',
      querySetName: 'auto-generated-queries-2025-10-23-18-15',
      judgmentId: 'auto-generated-ratings-123',
      judgmentName: 'auto-generated-ratings-2025-10-23-18-15',
      numRatings: 250,
      avgRating: 3.2,
    },
  };

  return (
    <QuickStartResults
      {...mockData}
      onTestConfiguration={() => {
        notifications.toasts.addInfo('Test configuration feature coming soon');
      }}
      onRunNewOptimization={() => {
        history.push('/experiment/create');
      }}
      onSwitchToAdvanced={() => {
        notifications.toasts.addInfo('Switching to Advanced mode with generated resources');
      }}
      onViewQueries={() => {
        notifications.toasts.addInfo('View queries feature coming soon');
      }}
      onViewRatings={() => {
        notifications.toasts.addInfo('View ratings feature coming soon');
      }}
      onDeploy={() => {
        notifications.toasts.addWarning('Deploy feature coming soon');
      }}
    />
  );
};

export const QuickStartMockResultsPageWithRouter = withRouter(QuickStartMockResultsPage);
