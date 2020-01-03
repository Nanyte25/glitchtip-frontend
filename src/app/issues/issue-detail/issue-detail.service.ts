import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, combineLatest } from "rxjs";
import { tap, map, exhaustMap } from "rxjs/operators";
import { baseUrl } from "src/app/constants";
import { IssueDetail, EventDetail } from "../interfaces";
import { OrganizationsService } from "src/app/api/organizations/organizations.service";

interface IssueDetailState {
  issue: IssueDetail | null;
  event: EventDetail | null;
}

const initialState: IssueDetailState = {
  issue: null,
  event: null
};

@Injectable({
  providedIn: "root"
})
export class IssueDetailService {
  private readonly state = new BehaviorSubject<IssueDetailState>(initialState);
  private readonly getState$ = this.state.asObservable();
  private readonly url = baseUrl + "/issues/";
  readonly issue$ = this.getState$.pipe(map(state => state.issue));
  readonly event$ = this.getState$.pipe(map(state => state.event));
  readonly hasNextEvent$ = this.event$.pipe(
    map(event => event && event.nextEventID !== null)
  );
  readonly hasPreviousEvent$ = this.event$.pipe(
    map(event => event && event.previousEventID !== null)
  );
  readonly nextEventUrl$ = combineLatest(
    this.organization.activeOrganizationSlug$,
    this.issue$,
    this.event$
  ).pipe(
    map(([orgSlug, issue, event]) => {
      if (event && event.nextEventID) {
        return this.eventUrl(orgSlug, issue, event.nextEventID);
      }
      return null;
    })
  );
  readonly previousEventUrl$ = combineLatest(
    this.organization.activeOrganizationSlug$,
    this.issue$,
    this.event$
  ).pipe(
    map(([orgSlug, issue, event]) => {
      if (event && event.previousEventID) {
        return this.eventUrl(orgSlug, issue, event.previousEventID);
      }
      return null;
    })
  );

  constructor(
    private http: HttpClient,
    private organization: OrganizationsService
  ) {}

  retrieveIssue(id: number) {
    return this.http.get<IssueDetail>(`${this.url}${id}/`).pipe(
      tap(issue => this.setIssue(issue)),
      exhaustMap(issue => this.retrieveLatestEvent(issue.id))
    );
  }

  getPreviousEvent() {
    const state = this.state.getValue();
    if (state.issue && state.event && state.event.previousEventID) {
      this.retrieveEvent(state.issue.id, state.event.previousEventID);
    }
  }

  getNextEvent() {
    const state = this.state.getValue();
    if (state.issue && state.event && state.event.nextEventID) {
      this.retrieveEvent(state.issue.id, state.event.nextEventID);
    }
  }

  private retrieveLatestEvent(issueId: number) {
    const url = `${this.url}${issueId}/events/latest/`;
    return this.http
      .get<EventDetail>(url)
      .pipe(tap(event => this.setEvent(event)));
  }

  private retrieveEvent(issueId: number, eventId: string) {
    const url = `${this.url}/${issueId}/events/${eventId}/`;
    return this.http
      .get<EventDetail>(url)
      .pipe(tap(event => this.setEvent(event)));
  }

  clearState() {
    this.state.next(initialState);
  }

  private setIssue(issue: IssueDetail) {
    this.state.next({ ...this.state.getValue(), issue });
  }

  private setEvent(event: EventDetail) {
    this.state.next({ ...this.state.getValue(), event });
  }

  /** Build event detail url string */
  private eventUrl(
    orgSlug: string | null,
    issue: IssueDetail | null,
    eventId: string
  ) {
    if (orgSlug && issue) {
      return `/organizations/${orgSlug}/issues/${issue.id}/events/${eventId}`;
    }
    return null;
  }
}
