/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Toggle from '$app/components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useHandleCustomFieldChange } from '$app/common/hooks/useHandleCustomFieldChange';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { Card } from '$app/components/cards';
import { InputField, Link } from '$app/components/forms';
import { TabGroup } from '$app/components/TabGroup';
import { Field } from '$app/pages/settings/custom-fields/components';
import { Element } from '$app/components/cards';
import { useHandleCustomSurchargeFieldChange } from '$app/common/hooks/useHandleCustomSurchargeFieldChange';
import { Divider } from '$app/components/cards/Divider';
import { useSetSurchageTaxValue } from '../hooks/useSetSurchargeTaxValue';
import { Invoice } from '$app/common/interfaces/invoice';
import { ChangeHandler } from '$app/pages/invoices/create/Create';
import { useLocation, useParams } from 'react-router-dom';
import { Upload } from '$app/pages/settings/company/documents/components';
import { date, endpoint } from '$app/common/helpers';
import { useQuery, useQueryClient } from 'react-query';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { DesignSelector } from '$app/common/generic/DesignSelector';
import { UserSelector } from '$app/components/users/UserSelector';
import { VendorSelector } from '$app/components/vendors/VendorSelector';
import { route } from '$app/common/helpers/route';
import { CustomFieldsPlanAlert } from '$app/components/CustomFieldsPlanAlert';
import { useShouldDisableCustomFields } from '$app/common/hooks/useShouldDisableCustomFields';
import { useState } from 'react';
import { request } from '$app/common/helpers/request';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';

interface Props {
  invoice?: Invoice;
  handleChange: ChangeHandler;
}

dayjs.extend(relativeTime);

export function InvoiceFooter(props: Props) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const company = useCurrentCompany();
  const location = useLocation();

  const { invoice, handleChange } = props;
  const { id } = useParams();

  const handleCustomFieldChange = useHandleCustomFieldChange();
  const handleCustomSurchargeFieldChange =
    useHandleCustomSurchargeFieldChange();

  const disabledCustomFields = useShouldDisableCustomFields();

  const surchargeValue = (index: number) => {
    switch (index) {
      case 0:
        return company?.custom_surcharge_taxes1;
      case 1:
        return company?.custom_surcharge_taxes2;
      case 2:
        return company?.custom_surcharge_taxes3;
      case 3:
        return company?.custom_surcharge_taxes4;
    }
  };

  const setSurchargeTaxValue = useSetSurchageTaxValue();

  const tabs = [
    t('public_notes'),
    t('private_notes'),
    t('terms'),
    t('footer'),
    t('documents'),
    t('settings'),
    t('custom_fields'),
    t('history'),
  ];

  const onSuccess = () => {
    queryClient.invalidateQueries(route('/api/v1/invoices/:id', { id }));
  };

  const [tabIndex, setTabIndex] = useState(0);

  const { data: history } = useQuery({
    queryKey: [`/api/v1/invoices/${id}`, 'history'],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          `/api/v1/invoices/${id}?include=activities.history&per_page=999999&t=${invoice?.updated_at}`
        )
      ).then(
        (response: GenericSingleResourceResponse<Invoice>) => response.data.data
      ),
    enabled: Boolean(invoice) && tabIndex === 7,
  });

  const { dateFormat } = useCurrentCompanyDateFormats();
  const formatMoney = useFormatMoney();

  return (
    <Card className="col-span-12 xl:col-span-8 h-max px-6">
      <TabGroup tabs={tabs} onTabChange={setTabIndex}>
        <div>
          <MarkdownEditor
            value={invoice?.public_notes || ''}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={invoice?.private_notes || ''}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={invoice?.terms || ''}
            onChange={(value) => handleChange('terms', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={invoice?.footer || ''}
            onChange={(value) => handleChange('footer', value)}
          />
        </div>

        {location.pathname.endsWith('/create') ? (
          <div className="text-sm">{t('save_to_upload_documents')}.</div>
        ) : (
          <div>
            <Upload
              widgetOnly
              endpoint={endpoint('/api/v1/invoices/:id/upload', {
                id,
              })}
              onSuccess={onSuccess}
            />

            <DocumentsTable
              documents={invoice?.documents || []}
              onDocumentDelete={onSuccess}
            />
          </div>
        )}

        <div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <ProjectSelector
                  inputLabel={t('project')}
                  value={invoice?.project_id}
                  onChange={(project) => handleChange('project_id', project.id)}
                />
              </div>

              <InputField
                label={t('exchange_rate')}
                value={invoice?.exchange_rate || '1.00'}
                onValueChange={(value) =>
                  handleChange('exchange_rate', parseFloat(value) || 1)
                }
              />

              <Toggle
                label={t('auto_bill_enabled')}
                checked={invoice?.auto_bill_enabled || false}
                onChange={(value) => handleChange('auto_bill_enabled', value)}
              />

              <div className="space-y-2">
                <DesignSelector
                  inputLabel={t('design')}
                  value={invoice?.design_id}
                  onChange={(design) => handleChange('design_id', design.id)}
                  clearButton={Boolean(invoice?.design_id)}
                  onClearButtonClick={() => handleChange('design_id', '')}
                  disableWithQueryParameter
                />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <UserSelector
                  inputLabel={t('user')}
                  value={invoice?.assigned_user_id}
                  onChange={(user) => handleChange('assigned_user_id', user.id)}
                />
              </div>

              <div className="space-y-2">
                <VendorSelector
                  inputLabel={t('vendor')}
                  value={invoice?.vendor_id}
                  clearButton={Boolean(invoice?.vendor_id)}
                  onClearButtonClick={() => handleChange('vendor_id', '')}
                  onChange={(vendor) => handleChange('vendor_id', vendor.id)}
                />
              </div>

              <Toggle
                label={t('inclusive_taxes')}
                checked={invoice?.uses_inclusive_taxes || false}
                onChange={(value) =>
                  handleChange('uses_inclusive_taxes', value)
                }
              />
            </div>
          </div>
        </div>

        <div>
          <CustomFieldsPlanAlert />

          {company &&
            ['invoice1', 'invoice2', 'invoice3', 'invoice4'].map((field) => (
              <Field
                key={field}
                initialValue={company.custom_fields[field]}
                field={field}
                placeholder={t('invoice_field')}
                onChange={(value: any) => handleCustomFieldChange(field, value)}
                noExternalPadding
              />
            ))}

          <Divider />

          {company &&
            ['surcharge1', 'surcharge2', 'surcharge3', 'surcharge4'].map(
              (field, index) => (
                <Element
                  noExternalPadding
                  key={index}
                  leftSide={
                    <InputField
                      id={field}
                      value={company.custom_fields[field]}
                      placeholder={t('surcharge_field')}
                      onValueChange={(value) =>
                        handleCustomSurchargeFieldChange(field, value)
                      }
                      disabled={disabledCustomFields}
                    />
                  }
                >
                  <Toggle
                    label={t('charge_taxes')}
                    checked={surchargeValue(index)}
                    onChange={() => setSurchargeTaxValue(index)}
                  />
                </Element>
              )
            )}
        </div>

        <div className="space-y-6 h-56 overflow-y-auto">
          {history && history.activities?.length === 0 && (
            <p>{t('nothing_to_see_here')}</p>
          )}

          {history &&
            history.activities?.map((activity) => (
              <div className="space-y-2 text-sm" key={activity.id}>
                <div className="flex space-x-1">
                  <span>
                    {invoice?.client
                      ? formatMoney(
                          activity.history.amount,
                          invoice?.client?.country_id,
                          invoice?.client?.settings.currency_id
                        )
                      : null}
                  </span>
                  <span>&middot;</span>
                  <Link to={`/clients/${activity.client_id}`}>
                    {invoice?.client?.display_name}
                  </Link>
                </div>

                <div className="flex space-x-1">
                  <Link to={`/activities/${activity.id}`}>
                    {date(activity.created_at, `${dateFormat} h:mm:ss A`)}
                  </Link>
                  <span>&middot;</span>
                  <span>{dayjs.unix(activity.created_at).fromNow()}</span>
                </div>
              </div>
            ))}
        </div>
      </TabGroup>
    </Card>
  );
}
