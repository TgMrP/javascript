import type {  NextPage } from 'next';
import { Waitlist } from '@clerk/nextjs';

const WailistPage: NextPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Waitlist />
    </div>
  )
}

export default WailistPage;