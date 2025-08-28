import type { VxeGridProps } from '@vben/plugins/vxe-table';

import { getProvidersApi } from '#/api/core/provider';

export const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'id', sortable: false, title: 'Id', width: 80 },
    { field: 'name', sortable: false, title: 'Name' },
    { field: 'type', sortable: false, title: 'Type' },
    { field: 'subType', sortable: false, title: 'Sub Type' },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 300,
    },
  ],
  exportConfig: {},
  height: 'auto',
  // keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page, sort }: any) => {
        return await getProvidersApi({
          page: page.currentPage,
          pageSize: page.pageSize,
          sortBy: sort.field,
          sortOrder: sort.order,
        });
      },
    },
    sort: true,
  },
  sortConfig: {
    defaultSort: { field: 'category', order: 'desc' },
    remote: true,
  },
  toolbarConfig: {
    custom: true,
    export: true,
    // import: true,
    refresh: { code: 'query' },
    zoom: true,
  },
};

export const goAddProvider = (router: any, parentId = 0) => {
  router.push({
    name: 'AddProvider',
    state: { parentId },
  });
};

export const goEditProvider = (router: any, row: any) => {
  router.push({
    name: 'EditProvider',
    params: { id: row.id },
  });
};

export const providerTypes: any = {
  Captcha: [
    'Default',
    'Aliyun',
    'ReCaptchaV2',
    'HCaptcha',
    'Cloudflare',
    'TencentTsec',
  ],
  Email: ['SMTP'],
  Auth: ['OAuth2', 'OIDC', 'SAML'],
  Storage: ['Local', 'S3'],
  SMS: ['Tencent', 'Twilio'],
};

export const providerTypesObject = Object.keys(providerTypes).map((el) => {
  return { label: el, value: el };
});

export const providerFieldArray: any = {
  Captcha: {
    Default: [{ name: 'port', label: '验证码长度' }],
    Aliyun: [
      { name: 'clientId', label: 'accessKeyId' },
      { name: 'clientSecret', label: 'accessKeySecret' },
      { name: 'authEndpoint', label: '身份标' },
      { name: 'sceneId', label: '场景ID' },
    ],
    ReCaptchaV2: [
      { name: 'clientId', label: 'accessKeyId' },
      { name: 'clientSecret', label: 'accessKeySecret' },
    ],
    HCaptcha: [
      { name: 'clientId', label: 'accessKeyId' },
      { name: 'clientSecret', label: 'accessKeySecret' },
    ],
    Cloudflare: [
      { name: 'clientId', label: 'accessKeyId' },
      { name: 'clientSecret', label: 'accessKeySecret' },
    ],
    TencentTsec: [
      { name: 'clientId', label: 'accessKeyId' },
      { name: 'clientSecret', label: 'accessKeySecret' },
      { name: 'authEndpoint', label: 'appId' },
      { name: 'configureUrl', label: 'appSecret' },
      { name: 'regionId', label: '区域ID' },
    ],
  },
  Auth: {
    OIDC: [
      { name: 'clientId', label: 'accessKeyId' },
      { name: 'clientSecret', label: 'accessKeySecret' },
      { name: 'configureUrl', label: 'OIDC Discovery' },
      { name: 'enableSSL', label: '使用用户信息端点' },
      { name: 'scopes', label: 'Scopes' },
      {
        name: 'jwksEndpoint',
        label: 'jwk端点',
      },
      {
        name: 'body',
        label: 'jwks',
        type: 'textarea',
        placeholder: '若为空，则会直接访问jwks端点获取',
      },
      { name: 'tokenType', label: 'response type' },
      { name: 'authEndpoint', label: '登陆端点', type: 'textarea' },
      { name: 'tokenEndpoint', label: 'Token端点' },
      { name: 'userInfoEndpoint', label: '用户信息端点' },
      { name: 'userInfoMap', label: '用户映射' },
    ],
    OAuth2: [
      { name: 'clientId', label: 'accessKeyId' },
      { name: 'clientSecret', label: 'accessKeySecret' },
      { name: 'authEndpoint', label: '登陆端点' },
      { name: 'tokenEndpoint', label: 'Token端点' },
      { name: 'tokenType', label: 'Token类型', default: 'Bearer' },
      { name: 'userInfoEndpoint', label: '用户信息端点' },
      { name: 'scopes', label: 'Scopes' },
      { name: 'userInfoMap', label: '用户映射' },
    ],
    SAML: [
      { name: 'configureUrl', label: 'IDP元数据链接' },
      { name: 'body', label: 'IDP元数据', type: 'textarea' },
      { name: 'enableSSL', label: 'Request签名' },
      { name: 'userInfoMap', label: '用户映射' },
    ],
  },
  Email: {
    SMTP: [
      { name: 'clientId', label: '用户名' },
      { name: 'clientSecret', label: '密码' },
      { name: 'configureUrl', label: 'SMTP服务器' },
      { name: 'port', label: '端口', default: 463 },
      { name: 'enableSSL', label: '启用加密' },
      { name: 'subject', label: '主题' },
      { name: 'body', label: '验证码内容' },
      { name: 'linkBody', label: '链接内容' },
    ],
  },
  SMS: {
    Tencent: [
      { name: 'clientId', label: 'SecretId' },
      { name: 'clientSecret', label: 'Secretkey' },
      { name: 'configureUrl', label: 'appId' },
      { name: 'authEndpoint', label: 'signName' },
      { name: 'tokenEndpoint', label: '模板Id' },
      { name: 'regionId', label: '区域ID' },
      { name: 'sceneId', label: 'senderId(国际)' },
    ],
    Twilio: [
      { name: 'clientId', label: 'Account SID' },
      { name: 'clientSecret', label: 'Auth Token' },
      { name: 'authEndpoint', label: '发件人号码' },
      { name: 'tokenEndpoint', label: '模板Id' },
      { name: 'regionId', label: '区域ID' },
      { name: 'sceneId', label: 'edge' },
    ],
  },
  Storage: {
    Local: [{ name: 'body', label: '路径前缀' }],
    S3: [
      { name: 'configureUrl', label: '端点' },
      { name: 'clientId', label: 'Access Key' },
      { name: 'clientSecret', label: 'Secret Key' },
      { name: 'enableSSL', label: '启用HTTPS' },
      { name: 'subject', label: '存储桶' },
      { name: 'body', label: '前缀' },
      { name: 'authEndpoint', label: 'Path格式' },
      { name: 'regionId', label: '区域' },
    ],
  },
};

const DefaultEmailBody = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>您的验证码</title>
  </head>
  <body>
    <style>
      body {
        background: #f6f8fa;
        font-family: "Segoe UI", "Arial", "PingFang SC", "Hiragino Sans GB",
          "Microsoft YaHei", sans-serif;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 400px;
        margin: 40px auto;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        padding: 32px 24px;
      }
      .title {
        font-size: 22px;
        color: #222;
        font-weight: 600;
        margin-bottom: 16px;
        text-align: center;
      }
      .desc {
        color: #666;
        font-size: 15px;
        margin-bottom: 24px;
        text-align: center;
      }
      .code-box {
        background: #f0f4f8;
        border-radius: 6px;
        padding: 18px 0;
        text-align: center;
        font-size: 32px;
        letter-spacing: 12px;
        color: #0078d4;
        font-weight: bold;
        margin-bottom: 24px;
      }
      .tip {
        color: #999;
        font-size: 13px;
        text-align: center;
      }
    </style>
    <div class="container">
      <div class="title">您的验证码</div>
      <div class="desc">请在提示时间内输入以下验证码</div>
      <div class="code-box">%code%</div>
      <div class="tip">验证码有效期为2分钟，请勿泄露给他人。</div>
    </div>
  </body>
</html>
`;

const DefaultLinkBody = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>您的验证码</title>
    <style>
        body {
            background: #f6f8fa;
            font-family: 'Segoe UI', 'Arial', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 400px;
            margin: 40px auto;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            padding: 32px 24px;
        }
        .title {
            font-size: 22px;
            color: #222;
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
        }
        .desc {
            color: #666;
            font-size: 15px;
            margin-bottom: 24px;
            text-align: center;
        }
        .code-box {
            background: #f0f4f8;
            border-radius: 6px;
            padding: 18px 0;
            text-align: center;
            font-size: 32px;
            color: #0078d4;
            font-weight: bold;
            margin-bottom: 24px;
        }
        .tip {
            color: #999;
            font-size: 13px;
            text-align: center;
        }
        .link {
          color: #0078d4;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="title">重置密码链接</div>
        <div class="desc">请在提示时间内进入链接并重置密码</div>
        <div class="code-box"><a href="%link%" class="link">重置密码</a></div>
        <div class="tip">链接有效期为2分钟，请尽快重置。</div>
      	<div class="tip" style="text-align: left; margin-top:20px;">或复制此链接 %link%</div>
      
    </div>
</body>
</html>
`;

export const DefaultEmailTemplate = {
  body: DefaultEmailBody,
  linkBody: DefaultLinkBody,
};
