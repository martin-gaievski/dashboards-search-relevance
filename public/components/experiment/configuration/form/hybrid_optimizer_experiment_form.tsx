/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { 
  EuiFlexGroup, 
  EuiFlexItem, 
  EuiFormRow, 
  EuiFieldNumber,
  EuiButtonGroup,
  EuiSpacer,
  EuiText,
  EuiCallOut,
  EuiComboBox,
  EuiAccordion,
  EuiPanel
} from '@elastic/eui';
import { HybridOptimizerExperimentFormData, OptionLabel } from '../types';
import { CoreStart } from '../../../../../src/core/public';
import { SearchConfigForm } from '../search_configuration_form';
import { QuerySetsComboBox } from './query_sets_combo_box';
import { JudgmentsComboBox } from './judgments_combo_box';
import {
  mapToOptionLabels,
  mapOptionLabelsToFormData,
  mapQuerySetToOptionLabels,
} from '../configuration_form';

export interface HybridOptimizerExperimentFormRef {
  validateAndSetErrors: () => { isValid: boolean; data: HybridOptimizerExperimentFormData };
  clearAllErrors: () => void;
}

interface HybridOptimizerExperimentFormProps {
  formData: HybridOptimizerExperimentFormData;
  onChange: (field: keyof HybridOptimizerExperimentFormData, value: any) => void;
  http: CoreStart['http'];
}

export const HybridOptimizerExperimentForm = forwardRef<
  HybridOptimizerExperimentFormRef,
  HybridOptimizerExperimentFormProps
>(({ formData, onChange, http }, ref) => {
  const [mode, setMode] = useState<'quickstart' | 'advanced'>('quickstart');
  const [querySetOptions, setQuerySetOptions] = useState<OptionLabel[]>([]);
  const [selectedSearchConfigs, setSelectedSearchConfigs] = useState<OptionLabel[]>([]);
  const [k, setK] = useState<number>(10);
  const [judgmentOptions, setJudgmentOptions] = useState<OptionLabel[]>([]);

  const [querySetError, setQuerySetError] = useState<string[]>([]);
  const [kError, setKError] = useState<string[]>([]);
  const [searchConfigError, setSearchConfigError] = useState<string[]>([]);
  const [judgmentError, setJudgmentError] = useState<string[]>([]);

  // Auto-Optimized specific state
  const [selectedIndex, setSelectedIndex] = useState<OptionLabel[]>([]);
  const [selectedLLMModel, setSelectedLLMModel] = useState<OptionLabel[]>([
    { label: 'Default (GPT-4)', value: 'gpt-4' }
  ]);
  const [numTestQueries, setNumTestQueries] = useState<number>(20);
  const [ratingThreshold, setRatingThreshold] = useState<number>(3);
  const [autoOptimizedK, setAutoOptimizedK] = useState<number>(10);
  const [indexError, setIndexError] = useState<string[]>([]);

  const clearAllErrors = () => {
    setQuerySetError([]);
    setKError([]);
    setSearchConfigError([]);
    setJudgmentError([]);
    setIndexError([]);
  };

  useEffect(() => {
    setQuerySetOptions(mapQuerySetToOptionLabels(formData.querySetId, formData.querySetName));

    setK(formData.size ?? 10);

    setSelectedSearchConfigs(mapToOptionLabels(formData.searchConfigurationList));

    setJudgmentOptions(mapToOptionLabels(formData.judgmentList));

    clearAllErrors(); // Clear errors on formData prop change
  }, [formData]); // Dependency array: re-run effect if 'formData' changes

  const validateAndSetErrors = (): {
    isValid: boolean;
    data: HybridOptimizerExperimentFormData;
  } => {
    let isValid = true;

    // In Auto-Optimized mode, only validate index - this is a mock, won't call backend
    if (mode === 'auto-optimized') {
      if (!selectedIndex.length) {
        setIndexError(['Please select an index to optimize.']);
        isValid = false;
      } else {
        setIndexError([]);
      }

      // Return mock data - won't be used since we'll show results directly
      const mockData: HybridOptimizerExperimentFormData = {
        querySetId: 'mock-query-set',
        size: autoOptimizedK,
        searchConfigurationList: ['mock-config'],
        judgmentList: ['mock-judgment'],
        type: formData.type,
        isAutoOptimizedMode: true, // Flag for mock mode
      } as any;

      return { isValid, data: mockData };
    }

    // Advanced mode validation
    const currentData: HybridOptimizerExperimentFormData = {
      querySetId: querySetOptions[0]?.value || '',
      size: k,
      searchConfigurationList: selectedSearchConfigs.map((c) => c.value),
      judgmentList: judgmentOptions.map((j) => j.value),
      type: formData.type,
    };

    if (!currentData.querySetId) {
      setQuerySetError(['Please select a query set.']);
      isValid = false;
    } else {
      setQuerySetError([]);
    }

    if (isNaN(currentData.size) || currentData.size < 1) {
      setKError(['K value must be a positive number.']);
      isValid = false;
    } else {
      setKError([]);
    }

    if (currentData.searchConfigurationList.length !== 1) {
      setSearchConfigError(['Please select exactly one search configuration.']);
      isValid = false;
    } else {
      setSearchConfigError([]);
    }

    if (!currentData.judgmentList.length) {
      setJudgmentError(['Please select at least one judgment list.']);
      isValid = false;
    } else {
      setJudgmentError([]);
    }

    return { isValid, data: currentData };
  };

  useImperativeHandle(ref, () => ({
    validateAndSetErrors,
    clearAllErrors,
  }));

  const handleQuerySetsChange = (selectedOptions: OptionLabel[]) => {
    const safeSelectedOptions = selectedOptions || []; // Ensure it's always an array
    setQuerySetOptions(safeSelectedOptions);
    const newQuerySetId = safeSelectedOptions.length > 0 ? safeSelectedOptions[0].value : '';
    const newQuerySetName = safeSelectedOptions.length > 0 ? safeSelectedOptions[0].label : ''; // Get the name/label

    if (formData.querySetId !== newQuerySetId) {
      onChange('querySetId', newQuerySetId);
    }
    if ((formData as any).querySetName !== newQuerySetName) {
      onChange('querySetName' as keyof HybridOptimizerExperimentFormData, newQuerySetName);
    }

    if (safeSelectedOptions.length > 0 && querySetError.length > 0) {
      setQuerySetError([]);
    }
  };

  const handleJudgmentsChange = (selectedOptions: OptionLabel[]) => {
    const safeSelectedOptions = selectedOptions || [];
    setJudgmentOptions(safeSelectedOptions);
    const newValues = safeSelectedOptions.map((o) => ({ id: o.value, name: o.label }));
    if (JSON.stringify(formData.judgmentList) !== JSON.stringify(newValues)) {
      onChange('judgmentList', newValues);
    }
    if (safeSelectedOptions.length > 0 && judgmentError.length > 0) {
      setJudgmentError([]);
    }
  };

  const handleKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setK(value);
    if (formData.size !== value) {
      onChange('size', value);
    }
    if (!isNaN(value) && value >= 1 && kError.length > 0) {
      setKError([]);
    }
  };

  const handleSearchConfigChange = (selectedOptions: OptionLabel[]) => {
    const safeSelectedOptions = selectedOptions || [];
    setSelectedSearchConfigs(safeSelectedOptions);
    const newValues = safeSelectedOptions.map((o) => ({ id: o.value, name: o.label }));
    if (JSON.stringify(formData.searchConfigurationList) !== JSON.stringify(newValues)) {
      onChange('searchConfigurationList', newValues);
    }
    if (safeSelectedOptions.length === 1 && searchConfigError.length > 0) {
      setSearchConfigError([]);
    }
  };

  const modeButtons = [
    { id: 'quickstart', label: 'Auto-Optimized' },
    { id: 'advanced', label: 'Manual' },
  ];

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiButtonGroup
          legend="Hybrid optimizer mode"
          options={modeButtons}
          idSelected={mode}
          onChange={(id) => setMode(id as 'quickstart' | 'advanced')}
          buttonSize="m"
          color="primary"
        />
      </EuiFlexItem>

      <EuiSpacer size="m" />

      {mode === 'quickstart' && (
        <>
          <EuiFlexItem>
            <EuiCallOut
              title="Auto-Optimized Mode"
              color="primary"
              iconType="iInCircle"
            >
              <EuiText size="s">
                <p>
                  Auto-Optimized automatically generates test queries, ratings, and search 
                  configurations using your index data and a hosted LLM. Simply select 
                  your index to begin.
                </p>
              </EuiText>
            </EuiCallOut>
          </EuiFlexItem>
          
          <EuiFlexItem>
            <EuiFormRow
              label="Index"
              helpText="Select the index to optimize"
              isInvalid={indexError.length > 0}
              error={indexError}
            >
              <EuiComboBox
                placeholder="Select index"
                singleSelection={{ asPlainText: true }}
                options={[
                  { label: 'my-product-index', value: 'my-product-index' },
                  { label: 'search-index', value: 'search-index' },
                ]}
                selectedOptions={selectedIndex}
                onChange={(options) => {
                  setSelectedIndex(options);
                  if (options.length > 0 && indexError.length > 0) {
                    setIndexError([]);
                  }
                }}
                isInvalid={indexError.length > 0}
              />
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiFormRow
              label="LLM Model (Optional)"
              helpText="Model used to generate ratings"
            >
              <EuiComboBox
                placeholder="Select LLM model"
                singleSelection={{ asPlainText: true }}
                options={[
                  { label: 'Default (GPT-4)', value: 'gpt-4' },
                  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
                  { label: 'Claude 3', value: 'claude-3' },
                ]}
                selectedOptions={selectedLLMModel}
                onChange={setSelectedLLMModel}
              />
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiAccordion
              id="autoOptimizedAdvancedOptions"
              buttonContent={
                <EuiText size="s">
                  <strong>⚙️ Advanced Options</strong>
                </EuiText>
              }
              paddingSize="m"
            >
              <EuiPanel color="subdued" paddingSize="m">
                <EuiFlexGroup direction="column" gutterSize="s">
                  <EuiFlexItem>
                    <EuiFormRow
                      label="Number of test queries"
                      helpText="How many queries to generate"
                    >
                      <EuiFieldNumber
                        value={numTestQueries}
                        onChange={(e) => setNumTestQueries(parseInt(e.target.value, 10))}
                        min={5}
                        max={100}
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiFormRow
                      label="Rating threshold"
                      helpText="Minimum relevance rating (1-5)"
                    >
                      <EuiFieldNumber
                        value={ratingThreshold}
                        onChange={(e) => setRatingThreshold(parseInt(e.target.value, 10))}
                        min={1}
                        max={5}
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiFormRow
                      label="K value"
                      helpText="Number of documents to include in results"
                    >
                      <EuiFieldNumber
                        value={autoOptimizedK}
                        onChange={(e) => setAutoOptimizedK(parseInt(e.target.value, 10))}
                        min={1}
                        max={100}
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiPanel>
            </EuiAccordion>
          </EuiFlexItem>
        </>
      )}

      {mode === 'advanced' && (
        <>
          <EuiFlexItem>
            <EuiFlexGroup gutterSize="m" direction="row" style={{ maxWidth: 600 }}>
              <EuiFlexItem grow={4}>
                <EuiFormRow
                  label="Query Set"
                  isInvalid={querySetError.length > 0}
                  error={querySetError}
                >
                  <QuerySetsComboBox
                    selectedOptions={querySetOptions}
                    onChange={handleQuerySetsChange}
                    http={http}
                    hideLabel={true}
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem grow={1}>
                <EuiFormRow
                  label="K Value"
                  helpText="The number of documents to include from the result list."
                  isInvalid={kError.length > 0}
                  error={kError}
                >
                  <EuiFieldNumber
                    placeholder="Enter k value"
                    value={k}
                    onChange={handleKChange}
                    min={1}
                    fullWidth
                    isInvalid={kError.length > 0}
                  />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow
              label="Search Configuration"
              helpText="Select exactly one search configuration."
              isInvalid={searchConfigError.length > 0}
              error={searchConfigError}
            >
              <SearchConfigForm
                selectedOptions={selectedSearchConfigs}
                onChange={handleSearchConfigChange}
                http={http}
                maxNumberOfOptions={1}
                hideLabel={true}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow label="Judgments" isInvalid={judgmentError.length > 0} error={judgmentError}>
              <JudgmentsComboBox
                selectedOptions={judgmentOptions}
                onChange={handleJudgmentsChange}
                http={http}
                hideLabel={true}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </>
      )}
    </EuiFlexGroup>
  );
});
