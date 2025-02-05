/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { ClientContact } from '$app/common/interfaces/client-contact';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { CustomField } from '$app/components/CustomField';
import Toggle from '$app/components/forms/Toggle';
import { set } from 'lodash';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 } from 'uuid';
import { useColorScheme } from '$app/common/colors';

interface Props {
  contacts: Partial<ClientContact>[];
  setContacts: Dispatch<SetStateAction<Partial<ClientContact>[]>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  errors: ValidationBag | undefined;
}

export function Contacts(props: Props) {
  const [t] = useTranslation();
  const accentColor = useAccentColor();
  const company = useCurrentCompany();

  const handleChange = (
    value: string | number | boolean,
    propertyId: string,
    contactId: string
  ) => {
    props.setErrors(undefined);

    const contactIndex = props.contacts.findIndex(
      (contact) => contact.contact_key === contactId
    );

    set(props.contacts[contactIndex], propertyId, value);

    props.setContacts(props.contacts);
  };

  const destroy = (index: number) => {
    const contacts = [...props.contacts];

    contacts.splice(index, 1);

    props.setContacts(contacts);
  };

  const create = () => {
    const contacts = [...props.contacts];

    contacts.push({
      contact_key: v4().replaceAll('-', ''),
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      send_email: false,
    });

    props.setContacts(contacts);
  };

  const colors = useColorScheme();

  return (
    <Card className="mt-4 xl:mt-0" title={t('contacts')}>
      {props.contacts.map((contact, index, row) => (
        <div
          key={index}
          className="pb-4 mb-4 border-b"
          style={{ borderColor: colors.$5 }}
        >
          <Element leftSide={t('first_name')}>
            <InputField
              id={`first_name_${index}`}
              value={contact.first_name}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleChange(
                  event.target.value,
                  'first_name',
                  contact.contact_key as string
                )
              }
              errorMessage={props.errors?.errors.name}
            />
          </Element>

          <Element leftSide={t('last_name')}>
            <InputField
              id={`last_name_${index}`}
              value={contact.last_name}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleChange(
                  event.target.value,
                  'last_name',
                  contact.contact_key as string
                )
              }
              errorMessage={props.errors?.errors.name}
            />
          </Element>

          <Element leftSide={t('email')}>
            <InputField
              id={`email_${index}`}
              value={contact.email}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleChange(
                  event.target.value,
                  'email',
                  contact.contact_key as string
                )
              }
              errorMessage={props.errors?.errors[`contacts.${index}.email`]}
            />
          </Element>

          {company?.settings.enable_client_portal_password && (
            <Element leftSide={t('password')}>
              <InputField
                id={`password_${index}`}
                type="password"
                value={contact.password}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange(
                    event.target.value,
                    'password',
                    contact.contact_key as string
                  )
                }
                errorMessage={
                  props.errors?.errors[`contacts.${index}.password`]
                }
              />
            </Element>
          )}

          <Element leftSide={t('phone')}>
            <InputField
              id={`phone_${index}`}
              value={contact.phone}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleChange(
                  event.target.value,
                  'phone',
                  contact.contact_key as string
                )
              }
              errorMessage={props.errors?.errors[`contacts.${index}.phone`]}
            />
          </Element>

          <Element leftSide={t('add_to_invoices')}>
            <Toggle
              checked={Boolean(contact?.send_email)}
              onChange={(value) =>
                handleChange(value, 'send_email', contact.contact_key as string)
              }
            />
          </Element>

          {company?.custom_fields?.contact1 && (
            <CustomField
              field="contact1"
              defaultValue={contact.custom_value1}
              value={company.custom_fields.contact1}
              onValueChange={(value) =>
                handleChange(
                  value,
                  'custom_value1',
                  contact.contact_key as string
                )
              }
            />
          )}

          {company?.custom_fields?.contact2 && (
            <CustomField
              field="contact2"
              defaultValue={contact.custom_value2}
              value={company.custom_fields.contact2}
              onValueChange={(value) =>
                handleChange(
                  value,
                  'custom_value2',
                  contact.contact_key as string
                )
              }
            />
          )}

          {company?.custom_fields?.contact3 && (
            <CustomField
              field="contact3"
              defaultValue={contact.custom_value3}
              value={company.custom_fields.contact3}
              onValueChange={(value) =>
                handleChange(
                  value,
                  'custom_value3',
                  contact.contact_key as string
                )
              }
            />
          )}

          {company?.custom_fields?.contact4 && (
            <CustomField
              field="contact4"
              defaultValue={contact.custom_value4}
              value={company.custom_fields.contact4}
              onValueChange={(value) =>
                handleChange(
                  value,
                  'custom_value4',
                  contact.contact_key as string
                )
              }
            />
          )}

          <Element>
            <div className="flex items-center">
              <div className="w-1/2">
                {props.contacts.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => destroy(index)}
                    className="text-red-600"
                  >
                    {t('remove_contact')}
                  </button>
                )}
              </div>

              <div className="w-1/2 flex justify-end">
                {index + 1 === row.length && (
                  <button
                    type="button"
                    onClick={create}
                    style={{ color: accentColor }}
                  >
                    {t('add_contact')}
                  </button>
                )}
              </div>
            </div>
          </Element>
        </div>
      ))}
    </Card>
  );
}
