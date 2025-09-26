import { client } from '@/api/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Accordion, Button, InputField, Modal, Textarea } from '@jod/design-system';
import React from 'react';
import {
  FieldErrors,
  Form,
  FormProvider,
  FormSubmitHandler,
  useForm,
  UseFormReturn,
  useFormState,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ExternalLink } from '../ExternalLink/ExternalLink';
import { FormError } from '../FormError/FormError';

interface SuggestNewContentFormModel {
  content: string;
  email: string;
  link: string;
  description: string;
}
interface SuggestNewContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestNewContentModal = ({ isOpen, onClose }: SuggestNewContentModalProps) => {
  const { t } = useTranslation();
  const formId = React.useId();
  const methods = useForm<SuggestNewContentFormModel>({
    mode: 'onBlur',
    resolver: zodResolver(
      z.object({
        content: z.string().min(1, t('suggest-new-content.errors.content')),
        email: z.union([
          z.string().length(0, t('suggest-new-content.errors.valid-email')),
          z.email(t('suggest-new-content.errors.valid-email')),
        ]),
        link: z.union([
          z.string().length(0, t('suggest-new-content.errors.link')),
          z.httpUrl(t('suggest-new-content.errors.link')),
        ]),
        description: z.string().min(1, t('suggest-new-content.errors.description')),
      }),
    ),
    defaultValues: {
      content: '',
      email: '',
      link: '',
      description: '',
    },
  });

  const { isValid, isLoading, errors, isSubmitting } = useFormState({ control: methods.control });

  return (
    <Modal
      open={isOpen}
      content={
        <SuggestNewContentForm
          onClose={onClose}
          isLoading={isLoading}
          errors={errors}
          methods={methods}
          formId={formId}
        />
      }
      data-testid="suggest-new-content-modal"
      footer={
        <div className="flex justify-end flex-1 gap-3">
          <Button
            variant="white"
            serviceVariant="ohjaaja"
            label={t('cancel')}
            onClick={onClose}
            className="whitespace-nowrap"
            data-testid="suggest-new-content.cancel"
          />
          <Button
            form={formId}
            variant="white"
            serviceVariant="ohjaaja"
            label={t('suggest-new-content.send')}
            className="whitespace-nowrap"
            disabled={!isValid || isSubmitting}
            data-testid="suggest-new-content.send"
          />
        </div>
      }
    />
  );
};

interface SuggestNewContentFormProps {
  onClose: () => void;
  isLoading: boolean;
  formId: string;
  errors: FieldErrors<SuggestNewContentFormModel>;
  methods: UseFormReturn<SuggestNewContentFormModel>;
}

const SuggestNewContentForm = ({ onClose, isLoading, formId, errors, methods }: SuggestNewContentFormProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [contentGuideIsOpen, setContentGuideIsOpen] = React.useState(false);

  const onSubmit: FormSubmitHandler<SuggestNewContentFormModel> = async (payload) => {
    try {
      const { content, email, link, description } = payload.data;
      const response = await client.POST('/api/sisaltoehdotus', {
        body: {
          sisalto: content,
          kuvaus: description,
          sahkoposti: email,
          linkki: link,
          kieli: language,
        },
      });

      if (!response.response.ok) {
        throw new Error();
      }
      onClose();
      // Wait a moment before showing success message
      setTimeout(() => alert(t('suggest-new-content.success')), 50);
    } catch (error) {
      console.error('Failed to submit new content suggestion:', error);
      alert(t('suggest-new-content.error'));
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-4 text-hero-mobile text-black sm:mb-5 sm:text-hero">{t('suggest-new-content.title')}</h2>

      <div className="flex flex-col gap-5 mb-5 text-body-md-mobile sm:text-body-md font-arial">
        <p>{t('suggest-new-content.description')}</p>
        <Accordion
          title={
            contentGuideIsOpen
              ? t('suggest-new-content.close-content-guide')
              : t('suggest-new-content.open-content-guide')
          }
          isOpen={contentGuideIsOpen}
          setIsOpen={setContentGuideIsOpen}
          lang={language}
          data-testid="suggest-new-content.content-guide-accordion"
        >
          <p>{t('suggest-new-content.content-guide')}</p>
        </Accordion>
      </div>

      <FormProvider {...methods}>
        <Form
          id={formId}
          onSubmit={onSubmit}
          onKeyDown={(event) => {
            const target = event.target as HTMLElement;
            const tagName = target.tagName.toLowerCase();
            // Allow hyperlink to be navigated with the keyboard
            if (tagName === 'a') {
              return;
            }
            // Prevent form submission on Enter
            if (event.key === 'Enter' && tagName !== 'textarea') {
              event.preventDefault();
            }
          }}
        >
          <div className="mb-6">
            <InputField
              label={t('suggest-new-content.content-label')}
              {...methods.register('content')}
              placeholder={t('suggest-new-content.content-placeholder')}
              data-testid="suggest-new-content.content"
            />
            <FormError name="content" errors={errors} />
          </div>
          <div className="mb-6">
            <InputField
              label={t('suggest-new-content.email-label')}
              {...methods.register('email')}
              placeholder={t('suggest-new-content.email-placeholder')}
              data-testid="suggest-new-content.email"
            />
            <FormError name="email" errors={errors} />
          </div>
          <div className="mb-6">
            <InputField
              label={t('suggest-new-content.link-label')}
              {...methods.register('link')}
              placeholder={t('suggest-new-content.link-placeholder')}
              data-testid="suggest-new-content.link"
            />
            <FormError name="link" errors={errors} />
          </div>

          <div className="mb-6">
            <Textarea
              label={t('suggest-new-content.description-label')}
              {...methods.register('description')}
              placeholder={t('suggest-new-content.description-placeholder')}
              rows={2}
              data-testid="suggest-new-content.description"
            />
            <FormError name="description" errors={errors} />
          </div>

          <hr className="h-1 bg-border-gray text-border-gray mb-7" />
          <div className="sm:text-body-md text-body-md-mobile">
            <p>{t('suggest-new-content.footer-info-1')}</p>
            <br />
            <p>
              <ExternalLink
                href={t('suggest-new-content.keha-privacy-policy-href')}
                className="font-poppins"
                data-testid="suggest-new-content-privacy-link"
              >
                {t('suggest-new-content.keha-privacy-policy-href-link-text')}
              </ExternalLink>
            </p>
          </div>
        </Form>
      </FormProvider>
    </div>
  );
};
