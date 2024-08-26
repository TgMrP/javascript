import { withCardStateProvider } from '../../elements';

const _Waitlist = () => {
  return (
    <div>
      <h1>Waitlist</h1>
    </div>
  );
};

export const Waitlist = withCardStateProvider(_Waitlist);
