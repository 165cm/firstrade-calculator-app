// src/app/privacy/page.tsx
import type { Metadata } from 'next';
import { OPERATOR, SERVICE_LEGAL } from '@/config/legal';
import { ExtLink, LegalLayout, LegalSection } from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: `${SERVICE_LEGAL.serviceName}のプライバシーポリシーです。`,
};

export default function PrivacyPage() {
  const name = SERVICE_LEGAL.serviceName;

  return (
    <LegalLayout title="プライバシーポリシー">
      <p>
        {OPERATOR.businessName}（以下「当方」）は、当方が提供する「{name}」（{SERVICE_LEGAL.siteUrl}、以下「本サービス」）における利用者の情報の取り扱いについて、以下のとおり定めます。
      </p>

      <LegalSection title="1. 取得する情報">
        <p className="font-semibold text-slate-900">(1) 本サービスに読み込むデータ</p>
        <p>
          本サービスに読み込んだCSVファイルの内容（取引・配当・損益など）は、利用者のブラウザの中だけで計算し、当方のサーバーには送信しません。
          計算結果は、次回の利用のためにブラウザの保存領域（localStorage）に保存されます。「入力データをリセット」ボタンで、いつでも削除できます。
        </p>
        <p>
          ただし、配当利回りの計算で株価を自動取得する場合に限り、銘柄コードを当方のサーバーに送信し、株価の取得に利用します。銘柄コード以外の情報は送信しません。
        </p>

        <p className="font-semibold text-slate-900">(2) 購入とライセンス認証に関する情報</p>
        <p>
          商品の購入・決済は、決済サービス「Gumroad」で行われます。クレジットカード等の決済情報を当方が取得することはありません。
          当方は、Gumroadから購入者のメールアドレス、氏名（登録されている場合）、購入内容の提供を受けます。
        </p>
        <p>
          ライセンス認証の際は、入力されたライセンスキーを当方のサーバーを通じてGumroadに照会します。認証結果（有効期限など）はブラウザに保存します。ライセンスキーやメールアドレスを当方のサーバーに記録することはありません。
        </p>

        <p className="font-semibold text-slate-900">(3) お問い合わせ・チャットサポート</p>
        <p>
          お問い合わせフォームでは、入力されたメールアドレスやお問い合わせ内容を取得します。
          チャットサポートに入力された内容は、回答を作成するために外部のAIサービス（GoogleのGemini API）に送信されます。チャットには、氏名や口座番号などの個人情報を入力しないでください。
        </p>

        <p className="font-semibold text-slate-900">(4) アクセス情報</p>
        <p>
          本サービスのサーバーは、IPアドレス、ブラウザの種類、アクセス日時、アクセスしたURLなどをアクセスログとして記録します。
          また、アクセス解析のためにGoogle アナリティクスを利用しています（「4. Cookieとアクセス解析」を参照）。
        </p>
      </LegalSection>

      <LegalSection title="2. 利用目的">
        <ul className="list-disc pl-5 space-y-1">
          <li>本サービスの提供、ライセンスの認証</li>
          <li>お問い合わせへの回答、購入者へのご案内（新しい年度版やクーポンのお知らせを含みます）</li>
          <li>不正利用の防止、障害への対応</li>
          <li>利用状況の分析と、本サービスの改善</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. 外部サービスの利用">
        <p>
          本サービスは、次の外部サービスを利用しています。各サービスでの情報の取り扱いは、それぞれのプライバシーポリシーをご確認ください。
        </p>
        <div className="space-y-3">
          {SERVICE_LEGAL.externalServices.map(service => (
            <div key={service.name} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-900">{service.name}</p>
              <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[6rem_1fr]">
                <dt className="text-slate-500">提供者</dt>
                <dd>{service.provider}（{service.country}）</dd>
                <dt className="text-slate-500">利用目的</dt>
                <dd>{service.purpose}</dd>
                <dt className="text-slate-500">扱う情報</dt>
                <dd>{service.data}</dd>
                <dt className="text-slate-500">ポリシー</dt>
                <dd><ExtLink href={service.policyUrl}>プライバシーポリシー</ExtLink></dd>
              </dl>
            </div>
          ))}
        </div>
        <p>
          これらのサービスの一部は外国（米国）の事業者が提供しています。当方は、外国の事業者を利用する際は、その国の個人情報の保護に関する制度を確認したうえで、必要な安全管理措置を講じます。
        </p>
      </LegalSection>

      <LegalSection title="4. Cookieとアクセス解析">
        <p>
          本サービスでは、アクセス状況の分析のためにGoogle アナリティクスを利用しています。Google アナリティクスは、Cookieを使って利用者の情報を収集します。収集される情報には、氏名など個人を特定する情報は含まれません。
        </p>
        <p>
          送信されるのは、閲覧したページやボタンの操作などの情報です。本サービスに読み込んだCSVの内容や金額が送信されることはありません。
        </p>
        <p>
          収集を望まない場合は、ブラウザの設定でCookieを無効にするか、
          <ExtLink href="https://tools.google.com/dlpage/gaoptout?hl=ja">Google アナリティクス オプトアウト アドオン</ExtLink>
          をご利用ください。
        </p>
      </LegalSection>

      <LegalSection title="5. 第三者への提供">
        <p>
          当方は、法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供しません。なお、「3. 外部サービスの利用」に記載した事業者に、本サービスの運営に必要な範囲で取り扱いを委託する場合があります。
        </p>
      </LegalSection>

      <LegalSection title="6. 安全管理">
        <p>
          当方は、取り扱う情報の漏えい、滅失または毀損を防ぐため、必要かつ適切な安全管理措置を講じます。
        </p>
        <p>
          本サービスに読み込んだデータは利用者のブラウザに保存されます。共用のパソコンでご利用の場合は、利用後に「入力データをリセット」でデータを削除してください。
        </p>
      </LegalSection>

      <LegalSection title="7. 開示・訂正・利用停止等の請求">
        <p>
          ご本人から、当方が保有する個人情報の開示、訂正、利用停止、削除等のご請求があった場合は、ご本人であることを確認したうえで、法令に従って遅滞なく対応します。下記のお問い合わせ先までご連絡ください。
        </p>
      </LegalSection>

      <LegalSection title="8. プライバシーポリシーの変更">
        <p>
          当方は、必要に応じて本ポリシーを変更することがあります。重要な変更をする場合は、本サービス上でお知らせします。変更後の内容は、本ページに掲載した時点から効力を生じます。
        </p>
      </LegalSection>

      <LegalSection title="9. お問い合わせ先">
        <p>
          {OPERATOR.businessName}
          <br />
          メールアドレス：<a href={`mailto:${OPERATOR.email}`} className="text-blue-600 hover:underline break-all">{OPERATOR.email}</a>
          <br />
          <ExtLink href={OPERATOR.contactUrl}>お問い合わせフォーム</ExtLink>
        </p>
      </LegalSection>

      <p className="text-sm text-slate-500">
        制定日：{SERVICE_LEGAL.privacyEstablished}
        {SERVICE_LEGAL.privacyUpdated && <><br />最終改定日：{SERVICE_LEGAL.privacyUpdated}</>}
      </p>
    </LegalLayout>
  );
}
