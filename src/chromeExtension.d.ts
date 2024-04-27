declare module chrome {
    interface EventChannel<Args extends unknown[] = []> {
        addListener: (callback: (...args: Args) => void | boolean) => void;
    }

    module runtime {
        interface MessageSender {}

        const id: string;
        const onInstalled: EventChannel<[details: { reason: string }]>;
        const onMessage: EventChannel<
            [message: { type: string }, sender: MessageSender, sendResponse: (response: unknown) => void]
        >;

        function sendMessage<Request extends { type: string }, Response = unknown>(
            extensionId: undefined,
            message: Request,
            options?: undefined,
            callback?: (response: Response) => void,
        ): Promise<Response>;
    }

    module action {
        const onClicked: EventChannel;
    }

    module tabs {
        // https://developer.chrome.com/docs/extensions/reference/api/tabs
        interface Tab {
            id: number;
            title: string;
            url: string;
        }

        interface TabCreateProperty {
            url: string;
        }

        function create(createProperties: TabCreateProperty, callback?: (tab: Tab) => void): Promise<Tab>;
        function query(queryInfo: Record<string, never>, callback?: () => Tab[]): Promise<Tab[]>;
        function get(tabId: number, callback?: (tab: Tab) => void): Promise<Tab>;
        function sendMessage<Request extends { type: string }, Response = unknown>(
            tabId: number,
            message: Request,
            options?: undefined,
            callback?: (response: Response) => void,
        ): Promise<Response>;
    }

    module declarativeNetRequest {
        interface UpdateRuleOptions {}

        function updateDynamicRules(options: UpdateRuleOptions, callback?: () => void): Promise<void>;
    }
}
