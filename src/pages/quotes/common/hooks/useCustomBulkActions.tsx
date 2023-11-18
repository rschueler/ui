/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Quote } from '$app/common/interfaces/quote';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useDownloadPdfs } from '$app/pages/invoices/common/hooks/useDownloadPdfs';
import { usePrintPdf } from '$app/pages/invoices/common/hooks/usePrintPdf';
import { useTranslation } from 'react-i18next';
import {
  MdContactPage,
  MdDesignServices,
  MdDone,
  MdDownload,
  MdMarkEmailRead,
  MdPrint,
} from 'react-icons/md';
import { useBulkAction } from './useBulkAction';
import { SendEmailBulkAction } from '../components/SendEmailBulkAction';
import { QuoteStatus } from '$app/common/enums/quote-status';
import { ConvertToInvoiceBulkAction } from '../components/ConvertToInoviceBulkAction';
import { ConvertToProjectBulkAction } from '../components/ConvertToProjectBulkAction';
import { useDocumentsBulk } from '$app/common/queries/documents';
import { toast } from '$app/common/helpers/toast/toast';
import { useNavigate } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { Dispatch, SetStateAction, useState } from 'react';
import { ChangeTemplateModal } from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';

export function useCustomBulkActions() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const printPdf = usePrintPdf({ entity: 'quote' });
  const downloadPdfs = useDownloadPdfs({ entity: 'quote' });

  const bulk = useBulkAction();

  const documentsBulk = useDocumentsBulk();

  const showApproveAction = (quotes: Quote[]) => {
    return quotes.every(
      ({ status_id }) =>
        status_id === QuoteStatus.Draft || status_id === QuoteStatus.Sent
    );
  };

  const showConvertToInvoiceAction = (quotes: Quote[]) => {
    return quotes.every(({ status_id }) => status_id !== QuoteStatus.Converted);
  };

  const showConvertToProjectAction = (quotes: Quote[]) => {
    return quotes.every(({ project_id }) => !project_id);
  };

  const showMarkSentAction = (quotes: Quote[]) => {
    return quotes.every(({ status_id }) => status_id === QuoteStatus.Draft);
  };

  const shouldDownloadDocuments = (quotes: Quote[]) => {
    return quotes.some(({ documents }) => documents.length);
  };

  const getDocumentsIds = (quotes: Quote[]) => {
    return quotes.flatMap(({ documents }) => documents.map(({ id }) => id));
  };

  const handleDownloadDocuments = (
    selectedQuotes: Quote[],
    setSelected?: Dispatch<SetStateAction<string[]>>
  ) => {
    const quoteIds = getDocumentsIds(selectedQuotes);

    documentsBulk(quoteIds, 'download');
    setSelected?.([]);
  };
  
  const [changeTemplateVisible, setChangeTemplateVisible] = useState(false);

  const customBulkActions: CustomBulkAction<Quote>[] = [
    ({ selectedIds, selectedResources, setSelected }) => (
      <SendEmailBulkAction
        selectedIds={selectedIds}
        selectedQuotes={selectedResources}
        setSelected={setSelected}
      />
    ),
    ({ selectedIds, setSelected }) => (
      <DropdownElement
        onClick={() => {
          printPdf(selectedIds);
          setSelected([]);
        }}
        icon={<Icon element={MdPrint} />}
      >
        {t('print_pdf')}
      </DropdownElement>
    ),
    ({ selectedIds, setSelected }) => (
      <DropdownElement
        onClick={() => {
          downloadPdfs(selectedIds);
          setSelected([]);
        }}
        icon={<Icon element={MdDownload} />}
      >
        {t('download_pdf')}
      </DropdownElement>
    ),
    ({ selectedResources }) =>
      selectedResources?.length &&
      selectedResources[0].invoice_id && (
        <DropdownElement
          onClick={() =>
            navigate(
              route('/invoices/:id/edit', {
                id: selectedResources[0].invoice_id,
              })
            )
          }
          icon={<Icon element={MdContactPage} />}
        >
          {t('view_invoice')}
        </DropdownElement>
      ),
    ({ selectedResources, setSelected }) => (
      <DropdownElement
        onClick={() =>
          selectedResources && shouldDownloadDocuments(selectedResources)
            ? handleDownloadDocuments(selectedResources, setSelected)
            : toast.error('no_documents_to_download')
        }
        icon={<Icon element={MdDownload} />}
      >
        {t('documents')}
      </DropdownElement>
    ),
    ({ selectedIds, selectedResources, setSelected }) =>
      selectedResources &&
      showMarkSentAction(selectedResources) && (
        <DropdownElement
          onClick={() => {
            bulk(selectedIds, 'sent');
            setSelected([]);
          }}
          icon={<Icon element={MdMarkEmailRead} />}
        >
          {t('mark_sent')}
        </DropdownElement>
      ),
    ({ selectedIds, selectedResources, setSelected }) =>
      selectedResources &&
      showApproveAction(selectedResources) && (
        <DropdownElement
          onClick={() => {
            bulk(selectedIds, 'approve');
            setSelected([]);
          }}
          icon={<Icon element={MdDone} />}
        >
          {t('approve')}
        </DropdownElement>
      ),
    ({ selectedIds, selectedResources, setSelected }) =>
      selectedResources &&
      showConvertToInvoiceAction(selectedResources) && (
        <ConvertToInvoiceBulkAction
          selectedIds={selectedIds}
          setSelected={setSelected}
        />
      ),
    ({ selectedIds, selectedResources, setSelected }) =>
      selectedResources &&
      showConvertToProjectAction(selectedResources) && (
        <ConvertToProjectBulkAction
          selectedIds={selectedIds}
          setSelected={setSelected}
        />
      ),
    ({ selectedResources }) => (
      <>
        {selectedResources ? (
          <ChangeTemplateModal<Quote>
            entity="quote"
            entities={selectedResources}
            visible={changeTemplateVisible}
            setVisible={setChangeTemplateVisible}
            labelFn={(quote) => `${t('number')}: ${quote.number}`}
            bulkUrl="/api/v1/quotes/bulk"
          />
        ) : null}

        <DropdownElement
          onClick={() => setChangeTemplateVisible(true)}
          icon={<Icon element={MdDesignServices} />}
        >
          {t('run_template')}
        </DropdownElement>
      </>
    ),
  ];

  return customBulkActions;
}
