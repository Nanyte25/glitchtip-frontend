import { ProjectIssueView } from "../api/projects/projects.interfaces";

export interface Event {
  eventID: string;
  tags: any[];
  projectID: string;
  dateCreated: string;
  user: any;
  message: string;
  id: string;
  culprit: string;
  title: string;
  location: string;
  crashFile: string | null;
  groupID: string;
  "event.type": EventTypes;
  platform: string;

  /* Before we delete this stuff, we should figure out where it came from. It didn't show up here by accident */
  // exception: {
  //   values: [
  //     {
  //       type: string; // "Error"
  //       value: string;
  //       stacktrace: {
  //         frames: {
  //           colno: number;
  //           filename: string;
  //           function: string;
  //           in_app: boolean;
  //           lineno: number;
  //         }[];
  //       };
  //       mechanism: {
  //         handled: boolean;
  //         type: string; // "generic"
  //       };
  //     }
  //   ];
  // };
  // level: string;
  // sdk: {
  //   name: string;
  //   version: string;
  //   packages: {
  //     name: string;
  //     version: string;
  //   }[];
  //   integrations: string[];
  // };
  // release: string;
  // request: {
  //   url: string;
  //   headers: {
  //     "User-Agent": string;
  //   };
  // };
  // breadcrumbs: any;
  // received_at: string;
}

export type EventTypes = "error" | "default";

export interface EventDetail extends Event {
  nextEventID: string | null;
  previousEventID: string | null;
  contexts: IContext;
  entries: IEntryStreamField[];
  metadata: IEventMetaData | any;
}

export interface IEntryStreamfieldBlock<Type extends string, Data extends {}> {
  data: Data;
  type: Type;
}

export type IEntryStreamField =
  | IEntryStreamfieldBlock<"exception", IValueData[]>
  | IEntryStreamfieldBlock<"breadcrumbs", IValueData[]>;
// | IEntryStreamfieldBlock<"request", IRequest>;

export interface IValueData {
  values: IValues[];
  excOmitted: boolean | null;
  hasSystemFrames: boolean;
}

export interface IRequest {
  fragment: string | null;
  cookies: object[];
  inferredContentType: string | null;
  env: string | null;
  headers: string[][];
  url: string;
  query: object[];
  data: string | null;
  method: string | null;
}

export type IssueStatus = "resolved" | "unresolved" | "ignored";

export interface Issue {
  annotations: string[];
  assignedTo: string | null;
  count: string;
  culprit: string | null;
  firstSeen: string;
  hasSeen: boolean;
  // id is a string in Sentry, but we would prefer a number if possible
  id: number;
  isBookmarked: boolean;
  isPublic: boolean;
  isSubscribed: boolean;
  lastSeen: string;
  level: string;
  logger: string | null;
  metadata: IIssueMetadata | any;
  numComments: number;
  permalink: string;
  project: ProjectIssueView;
  shareId: string | null;
  shortId: string;
  stats: IStats;
  status: IssueStatus;
  statusDetails: object;
  subscriptionDetails: object | null;
  title: string;
  type: string;
  userCount: number;
  platform: string;
}

// tslint:disable-next-line:no-empty-interface
export interface IssueDetail extends Issue {
  seenBy: object[];
  pluginIssues: string[];
  userReportCount: number;
  participants: any[];
  pluginActions: string[];
  tags: ITag[];
  firstRelease: IFirstRelase | null;
  pluginContexts: string[];
  lastRelease: string | null;
  activity: IActivity[];
}

export interface RetrieveIssuesParams {
  cursor?: string;
  query?: string;
  project?: string;
}

export interface UpdateStatusResponse {
  status: IssueStatus;
}

// not in issues api reference, but is in issue list data

export interface IssueWithSelected extends UpdateStatusResponse {
  isSelected: boolean;
}

type StatsPeriod = "24h" | "14d" | "30d" | "";

type IStats = { [StatPeriod in StatsPeriod]?: number[][] };

interface IIssueMetadata {
  filename: string;
  type: string;
  value: string;
  function: string;
}

interface IFirstRelase {
  authors: string[];
  commitCount: number;
  data: object;
  dataCreated: string;
  dataReleased: string;
  deployCount: number;
  firstEvent: string;
  lastCommit: string | null;
  lastDeploy: string | null;
  lastEvent: string;
  newGroups: number;
  owner: string | null;
  projects: ProjectIssueView[];
  ref: string | null;
  shortVersion: string;
  url: string | null;
  version: string;
}

interface IActivity {
  data: object;
  dateCreated: string;
  id: string;
  type: string;
  user: any | null;
}

interface ITag {
  totalValues: number;
  name: string;
  key: string;
}

interface IContext {
  os: IContextDetail;
  browser: IContextDetail;
}

interface IContextDetail {
  version: string;
  type: string;
  name: string;
}

interface IValues {
  stacktrace: IStacktrace;
  module: string | null;
  rawStacktrace: string | null;
  mechanism: IMechanism;
  threadId: number | null;
  value: string;
  type: string;
}

interface IMechanism {
  data: { function: string };
  type: string;
  handled: boolean;
}

interface IStacktrace {
  frames: IFrame[];
}

interface IFrame {
  function: string;
  errors: string | null;
  colNo: number;
  vars: string | null;
  package: string | null;
  absPath: string;
  inApp: boolean;
  lineNo: number;
  module: string;
  filename: string;
  platform: string | null;
  instructionAddr: string | null;
  context: string | number[][];
  symbolAddr: string | null;
  trust: string | null;
  symbol: string | null;
  rawFunction: string | null;
}

interface IEventMetaData {
  function: string;
  type: string;
  value: string;
  filename: string;
}
