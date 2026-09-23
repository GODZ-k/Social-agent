# apps/web/lib/api/actions.ts

- wait · function · L28-L28 — wait = (ms: number)
- clone · function · L29-L29 — clone = <T,>(v: T): T
- requireClient · function · L34-L39 — async function requireClient(id: string): Promise<Client>
- revalidateClient · function · L41-L44 — function revalidateClient(clientId: string)
- attempt · function · L47-L53 — async function attempt<T>(body: () => Promise<T>): Promise<ActionResult<T>>
- startScan · function · L55-L60 — async function startScan(url: string): Promise<ActionResult<{ scanId: string }>>
- readScan · function · L62-L69 — async function readScan(scanId: string): Promise<ActionResult<Scan>>
- createClient · function · L71-L98 — async function createClient(input: NewClientInput): Promise<ActionResult<Client>>
- firstStrategy · function · L101-L115 — function firstStrategy(client: Client, template: Strategy): Strategy
- updateClient · function · L118-L128 — async function updateClient(id: string, patch: ClientPatch): Promise<ActionResult<Client>>
- connectAccount · function · L138-L149 — async function connectAccount(clientId: string, platform: Platform): Promise<ActionResult<Client>>
- disconnectAccount · function · L151-L159 — async function disconnectAccount(clientId: string, platform: Platform): Promise<ActionResult<Client>>
- deleteClient · function · L161-L169 — async function deleteClient(id: string): Promise<ActionResult<null>>
- regenerateStrategy · function · L172-L184 — async function regenerateStrategy(clientId: string): Promise<ActionResult<Strategy>>
- shiftMixTowardLeader · function · L187-L195 — function shiftMixTowardLeader(strategy: Strategy)
- generatePosts · function · L197-L211 — async function generatePosts(clientId: string, count: number): Promise<ActionResult<Post[]>>
- draftPost · function · L213-L235 — function draftPost(client: Client, strategy: Strategy, serial: number, offset: number): Post
- updatePost · function · L237-L251 — async function updatePost(postId: string, patch: PostPatch): Promise<ActionResult<Post>>
