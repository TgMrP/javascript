import { useClerk } from '@clerk/shared/react';

import { descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { Card, Header, withCardStateProvider } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { useFormControl } from '../../utils';
import { WaitlistForm } from './WaitlistForm';

const _Waitlist = () => {
  const card = useCardState();
  const clerk = useClerk();

  const formState = {
    emailAddress: useFormControl('emailAddress', '', {
      type: 'email',
      label: localizationKeys('formFieldLabel__emailAddress'),
      placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    }),
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
            <WaitlistForm formState={formState} />
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
