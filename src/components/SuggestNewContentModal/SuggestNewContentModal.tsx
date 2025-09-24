import { zodResolver } from '@hookform/resolvers/zod';
import { Button, InputField, Modal, Textarea } from '@jod/design-system';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { FormError } from '../FormError/FormError';

interface SuggestNewContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestNewContentModal = ({ isOpen, onClose }: SuggestNewContentModalProps) => {
  const { t } = useTranslation();
  const formId = React.useId();

  const [isValid, setIsValid] = React.useState(false);

  return (
    <Modal
      open={isOpen}
      content={<SuggestNewContentForm onClose={onClose} setValid={setIsValid} formId={formId} />}
      fullWidthContent
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
            disabled={!isValid}
            data-testid="suggest-new-content.send"
          />
        </div>
      }
    />
  );
};

interface SuggestNewContentFormModel {
  content: string;
  email: string;
  link: string;
  description: string;
}

interface SuggestNewContentFormProps {
  onClose: () => void;
  setValid: (isValid: boolean) => void;
  formId: string;
}

const SuggestNewContentForm = ({ onClose, setValid, formId }: SuggestNewContentFormProps) => {
  const { t } = useTranslation();

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

  const { isValid, isLoading, errors } = useFormState({ control: methods.control });
  React.useEffect(() => {
    setValid(isValid);
  }, [isValid, setValid]);

  const onSubmit: FormSubmitHandler<SuggestNewContentFormModel> = async () => {
    // send feedback actually to somewhere
    window.alert('Ehdotuksen lähetystä ei ole vielä toteutettu');
    onClose();
  };

  if (isLoading) {
    return null;
  }

  return (
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
          if (event.key === 'Enter') {
            event.preventDefault();
          }
        }}
      >
        <h2 className="mb-4 text-hero-mobile text-black sm:mb-5 sm:text-hero">{t('suggest-new-content.title')}</h2>

        <div className="flex flex-col gap-5 mb-5 text-body-md-mobile sm:text-body-md font-arial">
          <p>{t('suggest-new-content.description')}</p>
        </div>
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
      </Form>
    </FormProvider>
  );
};
