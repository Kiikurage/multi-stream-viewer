declare module chrome {
    // https://developer.chrome.com/docs/extensions/reference/api/events
    module events {
        // https://developer.chrome.com/docs/extensions/reference/api/events#type-Event
        interface Event<Args extends unknown[] = []> {
            addListener: (callback: (...args: Args) => void | boolean) => void;
            removeListener: (callback: (...args: Args) => void | boolean) => void;
        }
    }

    module runtime {
        interface MessageSender {
            tab?: tabs.Tab;
        }

        const id: string;

        // https://developer.chrome.com/docs/extensions/reference/api/runtime#method-getURL
        function getURL(path: string): string;

        function sendMessage<Request extends { type: string }, Response = unknown>(
            extensionId: undefined,
            message: Request,
            options?: undefined,
            callback?: (response: Response) => void,
        ): Promise<Response>;

        const onInstalled: events.Event<[details: { reason: string }]>;
        const onMessage: events.Event<
            [message: { type: string }, sender: MessageSender, sendResponse: (response: unknown) => void]
        >;
    }

    module action {
        const onClicked: events.Event;
    }

    // https://developer.chrome.com/docs/extensions/reference/api/tabs
    module tabs {
        // https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab
        interface Tab {
            id: number;
            title?: string;
            url?: string;
            pendingUrl?: string;
        }

        function create(createProperties: CreateProperties, callback?: (tab: Tab) => void): Promise<Tab>;
        interface CreateProperties {
            url: string;
        }

        // https://developer.chrome.com/docs/extensions/reference/api/tabs#method-query
        function query(queryInfo: QueryInfo, callback?: () => Tab[]): Promise<Tab[]>;
        interface QueryInfo {
            url?: string;
        }

        // https://developer.chrome.com/docs/extensions/reference/api/tabs#method-get
        function get(tabId: number, callback?: (tab: Tab) => void): Promise<Tab>;

        function sendMessage<Request extends { type: string }, Response = unknown>(
            tabId: number,
            message: Request,
            options?: undefined,
            callback?: (response: Response) => void,
        ): Promise<Response>;

        // https://developer.chrome.com/docs/extensions/reference/api/tabs#method-remove
        function remove(tabIds: number | number[], callback?: () => void): Promise<void>;

        // https://developer.chrome.com/docs/extensions/reference/api/tabs#method-update
        function update(
            tabId: number,
            updateProperties: UpdateProperties,
            callback?: (tab: Tab) => void,
        ): Promise<Tab | undefined>;
        interface UpdateProperties {
            active?: boolean;
            muted?: boolean;
        }

        // https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onCreated
        const onCreated: events.Event<[tab: Tab]>;

        // https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onRemoved
        const onRemoved: events.Event<[tabId: number, removeInfo: RemovedInfo]>;
        interface RemovedInfo {
            isWindowClosing: boolean;
            windowId: number;
        }
    }

    module declarativeNetRequest {
        interface UpdateRuleOptions {}

        function updateDynamicRules(options: UpdateRuleOptions, callback?: () => void): Promise<void>;
    }
}
