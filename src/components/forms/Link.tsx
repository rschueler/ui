/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from '$app/common/hooks/useAccentColor';
import React, { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  to: string;
  children: ReactNode;
  external?: boolean;
  disableNavigation?: boolean;
}

export function Link(props: Props) {
  const accentColor = useAccentColor();

  const { disableNavigation } = props;

  const css: React.CSSProperties = {
    color: accentColor,
  };

  if (props.external) {
    return (
      <a
        target="_blank"
        href={props.to}
        className={`text-center text-sm hover:underline ${props.className}`}
        style={css}
        rel="noreferrer"
      >
        {props.children}
      </a>
    );
  }

  return (
    <RouterLink
      className={`text-sm hover:underline ${props.className}`}
      style={{ ...css, pointerEvents: !disableNavigation ? 'all' : 'none' }}
      to={props.to}
    >
      {props.children}
    </RouterLink>
  );
}
