import { RouterOSClient } from 'routeros-client';

export interface MikroTikConfig {
    host: string;
    user: string;
    pass: string;
    port?: number;
}

export class MikroTikService {
    private config: MikroTikConfig;

    constructor(config: MikroTikConfig) {
        this.config = config;
    }

    private async getClient() {
        const client = new RouterOSClient({
            host: this.config.host,
            user: this.config.user,
            password: this.config.pass,
            port: this.config.port || 8728,
            timeout: 5000
        });
        return client;
    }

    /**
     * Add or update a PPPoE secret
     */
    async upsertUser(username: string, password: string, profile: string, comment: string) {
        console.log(`[MikroTik ${this.config.host}] Upserting user: ${username}`);
        const client = await this.getClient();
        try {
            const api = await client.connect() as any;

            // Check if user exists
            const existing = await api.write('/ppp/secret/print', [`?name=${username}`]);

            if (existing.length > 0) {
                // Update
                await api.write('/ppp/secret/set', [
                    `=.id=${existing[0]['.id'] || existing[0].id}`,
                    `=password=${password}`,
                    `=profile=${profile}`,
                    `=comment=${comment}`
                ]);
            } else {
                // Add
                await api.write('/ppp/secret/add', [
                    `=name=${username}`,
                    `=password=${password}`,
                    `=profile=${profile}`,
                    `=comment=${comment}`
                ]);
            }

            await client.close();
            return { success: true };
        } catch (error) {
            console.error('MikroTik Upsert Error:', error);
            client.close();
            throw error;
        }
    }

    /**
     * Disable a user (Secret)
     */
    async disableUser(username: string) {
        console.log(`[MikroTik ${this.config.host}] Disabling user: ${username}`);
        const client = await this.getClient();
        try {
            const api = await client.connect() as any;

            // 1. Find the secret ID
            const secrets = await api.write('/ppp/secret/print', [`?name=${username}`]);
            if (secrets.length > 0) {
                // 2. Disable it
                await api.write('/ppp/secret/set', [
                    `=.id=${secrets[0]['.id'] || secrets[0].id}`,
                    `=disabled=yes`
                ]);
            }

            // 3. Kick active session
            const active = await api.write('/ppp/active/print', [`?name=${username}`]);
            for (const sess of active) {
                await api.write('/ppp/active/remove', [`=.id=${sess['.id'] || sess.id}`]);
            }

            await client.close();
            return { success: true };
        } catch (error) {
            client.close();
            throw error;
        }
    }

    /**
     * Enable a user (Secret)
     */
    async enableUser(username: string) {
        console.log(`[MikroTik ${this.config.host}] Enabling user: ${username}`);
        const client = await this.getClient();
        try {
            const api = await client.connect() as any;

            // 1. Find the secret ID
            const secrets = await api.write('/ppp/secret/print', [`?name=${username}`]);
            if (secrets.length > 0) {
                // 2. Enable it
                await api.write('/ppp/secret/set', [
                    `=.id=${secrets[0]['.id'] || secrets[0].id}`,
                    `=disabled=no`
                ]);
            }

            await client.close();
            return { success: true };
        } catch (error) {
            client.close();
            throw error;
        }
    }

    /**
     * Suspend a user by changing their profile and kicking active session
     */
    async suspendUser(username: string, suspendedProfile: string = 'suspended') {
        console.log(`[MikroTik ${this.config.host}] Suspending user: ${username}`);
        const client = await this.getClient();
        try {
            const api = await client.connect() as any;

            // Find ID first for safety
            const secrets = await api.write('/ppp/secret/print', [`?name=${username}`]);
            if (secrets.length > 0) {
                await api.write('/ppp/secret/set', [
                    `=.id=${secrets[0]['.id'] || secrets[0].id}`,
                    `=profile=${suspendedProfile}`
                ]);
            }

            // 2. Remove active session to force reconnect
            const active = await api.write('/ppp/active/print', [`?name=${username}`]);
            for (const sess of active) {
                await api.write('/ppp/active/remove', [`=.id=${sess['.id'] || sess.id}`]);
            }

            await client.close();
            return { success: true };
        } catch (error) {
            client.close();
            throw error;
        }
    }

    /**
   * Reactivate a user by restoring their profile and kicking active session
   */
    async activateUser(username: string, profile: string) {
        console.log(`[MikroTik ${this.config.host}] Activating user: ${username} with profile: ${profile}`);
        const client = await this.getClient();
        try {
            const api = await client.connect() as any;

            const secrets = await api.write('/ppp/secret/print', [`?name=${username}`]);
            if (secrets.length > 0) {
                await api.write('/ppp/secret/set', [
                    `=.id=${secrets[0]['.id'] || secrets[0].id}`,
                    `=profile=${profile}`
                ]);
            }

            // 2. Remove active session to force reconnect
            const active = await api.write('/ppp/active/print', [`?name=${username}`]);
            for (const sess of active) {
                await api.write('/ppp/active/remove', [`=.id=${sess['.id'] || sess.id}`]);
            }

            await client.close();
            return { success: true };
        } catch (error) {
            client.close();
            throw error;
        }
    }

    /**
     * Get active connections with real-time stats
     */
    async getActiveConnections() {
        const client = await this.getClient();
        try {
            const api = await client.connect() as any;
            const active = await api.write('/ppp/active/print');
            await client.close();
            return active;
        } catch {
            client.close();
            return [];
        }
    }

    /**
     * Get system health and resource usage
     */
    async getHealth() {
        const client = await this.getClient();
        try {
            const api = await client.connect() as any;

            // Fetch resources (CPU, Memory, Uptime, Version)
            const resources = await api.write('/system/resource/print');

            // Fetch active sessions count
            const pppActive = await api.write('/ppp/active/print');
            const hsActive = await api.write('/ip/hotspot/active/print');

            await client.close();

            const res = resources[0];
            return {
                status: 'online',
                cpu: parseInt(res['cpu-load'] || '0'),
                memory: {
                    free: Math.round(parseInt(res['free-memory'] || '0') / 1024 / 1024),
                    total: Math.round(parseInt(res['total-memory'] || '0') / 1024 / 1024)
                },
                total_sessions: (pppActive?.length || 0) + (hsActive?.length || 0),
                uptime: res.uptime,
                version: res.version,
                board_name: res['board-name']
            };
        } catch {
            client.close();
            return { status: 'offline', cpu: 0, memory: { free: 0, total: 0 }, total_sessions: 0 };
        }
    }

    /**
     * Get active session for a specific subscriber
     */
    async getSubscriberSession(username: string) {
        const client = await this.getClient();
        try {
            const api = await client.connect() as any;
            const active = await api.write('/ppp/active/print', [`?name=${username}`]);
            await client.close();
            return active.length > 0 ? active[0] : null;
        } catch {
            client.close();
            return null;
        }
    }

    /**
     * Get firewall filter rules
     */
    async getFirewallRules() {
        const client = await this.getClient();
        try {
            const api = await client.connect() as any;
            const rules = await api.write('/ip/firewall/filter/print');
            await client.close();
            return rules;
        } catch {
            client.close();
            return [];
        }
    }

    /**
     * Add a firewall filter rule
     */
    async addFirewallRule(params: {
        chain?: string,
        action?: string,
        protocol?: string,
        'src-address'?: string,
        'dst-address'?: string,
        'dst-port'?: string,
        comment?: string
    }) {
        const client = await this.getClient();
        try {
            const api = await client.connect() as any;
            const cmd = ['/ip/firewall/filter/add'];

            if (params.chain) cmd.push(`=chain=${params.chain}`);
            if (params.action) cmd.push(`=action=${params.action}`);
            if (params.protocol) cmd.push(`=protocol=${params.protocol}`);
            if (params['src-address']) cmd.push(`=src-address=${params['src-address']}`);
            if (params['dst-address']) cmd.push(`=dst-address=${params['dst-address']}`);
            if (params['dst-port']) cmd.push(`=dst-port=${params['dst-port']}`);
            if (params.comment) cmd.push(`=comment=${params.comment}`);

            await api.write(cmd);
            await client.close();
            return { success: true };
        } catch (error) {
            client.close();
            throw error;
        }
    }

    /**
     * Toggle (Enable/Disable) a firewall rule
     */
    async toggleFirewallRule(mikrotikId: string, disabled: boolean) {
        const client = await this.getClient();
        try {
            const api = await client.connect() as any;
            await api.write('/ip/firewall/filter/set', [
                `=.id=${mikrotikId}`,
                `=disabled=${disabled ? 'yes' : 'no'}`
            ]);
            await client.close();
            return { success: true };
        } catch (error) {
            client.close();
            throw error;
        }
    }

    /**
     * Remove a firewall rule
     */
    async removeFirewallRule(mikrotikId: string) {
        const client = await this.getClient();
        try {
            const api = await client.connect() as any;
            await api.write('/ip/firewall/filter/remove', [`=.id=${mikrotikId}`]);
            await client.close();
            return { success: true };
        } catch (error) {
            client.close();
            throw error;
        }
    }
}

import pool from './db';

interface RouterRow {
    ip_address: string;
    username: string;
    password?: string | null;
    api_port?: number | null;
}

export async function getRouterService(routerId: number): Promise<MikroTikService | null> {
    const res = await pool.query<RouterRow>(
        'SELECT ip_address, username, password, api_port FROM routers WHERE id = $1',
        [routerId]
    );

    if (res.rows.length === 0) return null;
    const router = res.rows[0];

    return new MikroTikService({
        host: router.ip_address,
        user: router.username,
        pass: router.password || '',
        port: router.api_port || 8728
    });
}
