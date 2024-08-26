import { Col, localizationKeys } from '../../customizables';
import { Form } from '../../elements';
import type { FormControlState } from '../../utils';
import type { Fields } from './Waitlist';

type WaitlistFormProps = {
  handleSubmit: React.FormEventHandler;
  formState: Record<keyof Fields, FormControlState<any>>;
};

export const WaitlistForm = (props: WaitlistFormProps) => {
  const { formState, handleSubmit } = props;

  const fields: Fields = {
    emailAddress: {
      required: true,
    },
  };

  return (
    <Form.Root
      onSubmit={handleSubmit}
      gap={8}
    >
      <Col gap={6}>
        <Form.ControlRow elementId='emailAddress'>
          <Form.PlainInput
            {...formState.emailAddress.props}
            isRequired={fields.emailAddress!.required}
            isOptional={!fields.emailAddress!.required}
            isDisabled={fields.emailAddress!.disabled}
          />
        </Form.ControlRow>
      </Col>
      <Col center>
        <Form.SubmitButton
          hasArrow
          localizationKey={localizationKeys('formButtonPrimary')}
        />
      </Col>
    </Form.Root>
  );
};
