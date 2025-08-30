import { preferences, updatePreferences } from '@vben/preferences';
import { createPostFormAndSubmit } from '@vben/utils';

import { getOAuthReqestApi, getSamlRequestApi } from '#/api';
import { useAuthStore } from '#/store';

export async function handleThirdPartRedirect(
  provider: any,
  providerItem: any,
  state: any,
) {
  const authStore = useAuthStore();
  authStore.callbackState = state;
  if (provider.subType === 'OAuth2' || provider.subType === 'OIDC') {
    const { redirectUrl, tempId } = await getOAuthReqestApi({
      id: provider.id,
      type: 'login',
    });

    authStore.callbackState.tempId = tempId;
    window.location.href = redirectUrl;
    return;
  } else if (provider.subType === 'SAML') {
    const { request, binding, location, replayState } = await getSamlRequestApi(
      {
        id: provider.id,
        isCompressed: providerItem.rule?.includes('Compressed'),
      },
    );

    const params = new URLSearchParams();
    params.set('SAMLRequest', request);
    params.set('RelayState', replayState);

    if (binding === 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST') {
      createPostFormAndSubmit(params, location);
    }

    window.location.href = `${location}?${params.toString()}`;
    return;
  }

  window.console.log('未实现');
}

export function updateAppTheme(application: any) {
  let logo = application.logoUrl;
  if (preferences.theme.mode === 'dark') {
    logo = application.logoDarkUrl;
  }
  updatePreferences({
    app: {
      name: application.displayName,
    },
    logo: {
      source: logo,
      favicon: application.faviconUrl,
      sourceLight: application.logoUrl,
      sourceDark: application.logoDarkUrl,
    },
    theme: {
      colorPrimary: application.theme.primaryColor.replaceAll(', ', ' '),
      radius: application.theme.radius,
    },
  });

  if (application.faviconUrl) {
    const favicon: any = document.querySelector('link[rel="icon"]');
    favicon.href = application.faviconUrl;
  }
}
