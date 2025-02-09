import type { OrganizationJSON, SessionJSON } from '@clerk/types';

import { eventBus } from '../../events';
import { createFapiClient } from '../../fapiClient';
import { clerkMock, createUser, mockDevClerkInstance, mockJwt, mockNetworkFailedFetch } from '../../test/fixtures';
import { SessionTokenCache } from '../../tokenCache';
import { BaseResource, Organization, Session } from '../internal';

describe('Session', () => {
  afterEach(() => {
    SessionTokenCache.clear();
  });

  describe('creating new session', () => {
    let dispatchSpy;

    beforeEach(() => {
      dispatchSpy = jest.spyOn(eventBus, 'dispatch');
      BaseResource.clerk = clerkMock() as any;
    });

    afterEach(() => {
      dispatchSpy?.mockRestore();
      BaseResource.clerk = null as any;
      // @ts-ignore
      global.fetch?.mockClear();
      SessionTokenCache.clear();
    });

    it('dispatches token:update event on initialization with lastActiveToken', () => {
      new Session({
        status: 'active',
        id: 'session_1',

        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'activeOrganization',
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy.mock.calls[0]).toMatchSnapshot();
    });
  });

  describe('getToken()', () => {
    let dispatchSpy;

    beforeEach(() => {
      dispatchSpy = jest.spyOn(eventBus, 'dispatch');
      BaseResource.clerk = clerkMock() as any;
    });

    afterEach(() => {
      dispatchSpy?.mockRestore();
      BaseResource.clerk = null as any;
    });

    it('dispatches token:update event on getToken without active organization', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      await session.getToken();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy.mock.calls[0]).toMatchSnapshot();
    });

    it('hydrates token cache from lastActiveToken', async () => {
      BaseResource.clerk = clerkMock({
        organization: new Organization({ id: 'activeOrganization' } as OrganizationJSON),
      }) as any;

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'activeOrganization',
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const token = await session.getToken();

      await session.getToken({ organizationId: 'activeOrganization' });

      expect(BaseResource.clerk.getFapiClient().request).not.toHaveBeenCalled();

      expect(token).toEqual(mockJwt);
      expect(dispatchSpy).toHaveBeenCalledTimes(3);
    });

    it('dispatches token:update event on getToken with active organization', async () => {
      BaseResource.clerk = clerkMock({
        organization: new Organization({ id: 'activeOrganization' } as OrganizationJSON),
      }) as any;

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'activeOrganization',
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      await session.getToken();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy.mock.calls[0]).toMatchSnapshot();
    });

    it('does not dispatch token:update if template is provided', async () => {
      BaseResource.clerk = clerkMock({
        organization: new Organization({ id: 'activeOrganization' } as OrganizationJSON),
      }) as any;

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'activeOrganization',
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      await session.getToken({ template: 'foobar' });

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
    });

    it('dispatches token:update when provided organization ID matches current active organization', async () => {
      BaseResource.clerk = clerkMock({
        organization: new Organization({ id: 'activeOrganization' } as OrganizationJSON),
      }) as any;

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'activeOrganization',
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      await session.getToken({ organizationId: 'activeOrganization' });

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });

    it('does not dispatch token:update when provided organization ID does not match current active organization', async () => {
      BaseResource.clerk = clerkMock({
        organization: new Organization({ id: 'anotherOrganization' } as OrganizationJSON),
      }) as any;

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'activeOrganization',
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      await session.getToken({ organizationId: 'activeOrganization' });

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
    });

    describe('with offline browser and network failure', () => {
      let warnSpy;
      beforeEach(() => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false,
        });
        warnSpy = jest.spyOn(console, 'warn').mockReturnValue();
      });

      afterEach(() => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: true,
        });
        warnSpy.mockRestore();
      });

      it('returns null', async () => {
        const session = new Session({
          status: 'active',
          id: 'session_1',
          object: 'session',
          user: createUser({}),
          last_active_organization_id: 'activeOrganization',
          actor: null,
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
        } as SessionJSON);

        mockNetworkFailedFetch();
        BaseResource.clerk = { getFapiClient: () => createFapiClient(mockDevClerkInstance) } as any;

        const token = await session.getToken();

        expect(global.fetch).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(token).toEqual(null);
      });
    });
  });

  describe('isAuthorized()', () => {
    it('user with permission to delete the organization should be able to delete the  organization', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({
          organization_memberships: [{ name: 'Org1', id: 'org1' }],
        }),
        last_active_organization_id: 'org1',
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const isAuthorized = await session.checkAuthorization({ permission: 'org:sys_profile:delete' });

      expect(isAuthorized).toBe(true);
    });

    it('user with permission to read memberships should not be deleting the organization', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({
          organization_memberships: [{ name: 'Org1', id: 'org1', permissions: ['org:sys_memberships:read'] }],
        }),
        last_active_organization_id: 'org1',
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const isAuthorized = await session.checkAuthorization({ permission: 'org:sys_profile:delete' });

      expect(isAuthorized).toBe(false);
    });
  });
});
