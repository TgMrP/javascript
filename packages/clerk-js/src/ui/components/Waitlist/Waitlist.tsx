import { useClerk, useWaitlist } from '@clerk/shared/react';
import type { JoinWaitlistParams } from '@clerk/types';

import { descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { Card, Header, withCardStateProvider } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { handleError, useFormControl } from '../../utils';
import { WaitlistForm } from './WaitlistForm';

const FieldKeys = ['emailAddress'];

export type FieldKey = (typeof FieldKeys)[number];

export type Field = {
  disabled?: boolean;
  /**
   * Denotes if the corresponding input is required to be filled
   */
  required: boolean;
};

export type Fields = {
  [key in FieldKey]: Field | undefined;
};

const _Waitlist = () => {
  const card = useCardState();
  const clerk = useClerk();
  clerk.joinWaitlist;

  const { joinWaitlist } = useWaitlist();

  const formState = {
    emailAddress: useFormControl('emailAddress', '', {
      type: 'email',
      label: localizationKeys('formFieldLabel__emailAddress'),
      placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    }),
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    card.setLoading();
    card.setError(undefined);

    try {
      const joinWaitlistParams: JoinWaitlistParams = { emailAddress: formState.emailAddress.value };

      const data = await joinWaitlist(joinWaitlistParams);

      console.log(data);
    } catch (error) {
      handleError(error, [], card.setError);
    }
  };

  return (
    <Flow.Root flow='waitlist'>
      <Card.Root>
        <Card.Content>
          <Header.Root>
            <Header.Title localizationKey={localizationKeys('waitlist.start.title')} />
            <Header.Subtitle localizationKey={localizationKeys('waitlist.start.subtitle')} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={6}
          >
            <WaitlistForm
              handleSubmit={handleSubmit}
              formState={formState}
            />
          </Flex>
        </Card.Content>
        <Card.Footer>
          <Card.Action elementId='waitlist'>
            <Card.ActionText localizationKey={localizationKeys('signIn.start.actionText')} />
            <Card.ActionLink
              localizationKey={localizationKeys('signUp.start.actionLink')}
              // to={clerk.buildUrlWithAuth(signInUrl)}
            />
          </Card.Action>
        </Card.Footer>
      </Card.Root>
    </Flow.Root>
  );
};

export const Waitlist = withCardStateProvider(_Waitlist);
