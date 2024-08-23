import { Col, localizationKeys } from '../../customizables';
import { Form } from '../../elements';
import type { FormControlState } from '../../utils';

const FieldKeys = ['emailAddress'];
export type FieldKey = (typeof FieldKeys)[number];

export type Field = {
  disabled?: boolean;
  /**
   * Denotes if the corresponding input is required to be filled
   */
  required: boolean;
};

type Fields = {
  [key in FieldKey]: Field | undefined;
};

type WaitlistFormProps = {
  formState: Record<keyof Fields, FormControlState<any>>;
};

export const WaitlistForm = (props: WaitlistFormProps) => {
  const { formState } = props;

  const fields: Fields = {
    emailAddress: {
      required: true,
    },
  };

  const handleSubmit = () => {
    console.log('WaitlistForm');
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
