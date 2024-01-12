/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useProductsQuery } from '$app/common/queries/products';
import { Spinner } from '$app/components/Spinner';
import { Element } from '$app/components/cards';
import { SelectOption } from '$app/components/datatables/Actions';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select, { MultiValue, StylesConfig } from 'react-select';
import { useColorScheme } from '$app/common/colors';
import { Alert } from '$app/components/Alert';

interface Props {
  value?: string;
  onValueChange: (productsKeys: string) => void;
  errorMessage?: string[] | string;
}
export function ProductItemsSelector(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const { value, onValueChange, errorMessage } = props;

  const [productItems, setProductItems] = useState<SelectOption[]>();

  const { data: products } = useProductsQuery({ status: ['active'] });

  useEffect(() => {
    if (products) {
      setProductItems(
        products.map((product) => ({
          value: product.product_key,
          label: product.product_key,
          color: colors.$3,
          backgroundColor: colors.$1,
        }))
      );
    }
  }, [products]);

  const handleChange = (
    products: MultiValue<{ value: string; label: string }>
  ) => {
    return (products as SelectOption[])
      .map((option: { value: string; label: string }) => option.value)
      .join(',');
  };

  const customStyles: StylesConfig<SelectOption, true> = {
    multiValue: (styles, { data }) => {
      return {
        ...styles,
        backgroundColor: data.backgroundColor,
        color: data.color,
        borderRadius: '3px',
      };
    },
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      color: data.color,
    }),
    multiValueRemove: (styles) => ({
      ...styles,
      ':hover': {
        color: 'white',
      },
      color: '#999999',
    }),
    menu: (base) => ({
      ...base,
      width: 'max-content',
      minWidth: '100%',
      backgroundColor: colors.$4,
      borderColor: colors.$4,
    }),
    control: (base) => ({
      ...base,
      borderRadius: '3px',
      backgroundColor: colors.$1,
      color: colors.$3,
      borderColor: colors.$5,
    }),
    option: (base) => ({
      ...base,
      backgroundColor: colors.$1,
      ':hover': {
        backgroundColor: colors.$7,
      },
    }),
  };

  return (
    <>
      {productItems || !value || !value?.length ? (
        <Element leftSide={t('products')}>
          <Select
            id="productItemSelector"
            placeholder={t('products')}
            {...(value && {
              value: productItems?.filter((option) =>
                value
                  .split(',')
                  .find((productKey) => productKey === option.value)
              ),
            })}
            onChange={(options) => onValueChange(handleChange(options))}
            options={productItems}
            isMulti={true}
            styles={customStyles}
          />
        </Element>
      ) : (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      )}

      {errorMessage && (
        <Alert className="mt-2" type="danger">
          {errorMessage}
        </Alert>
      )}
    </>
  );
}
