import { Component, OnInit } from "@angular/core";
import { Router, RoutesRecognized, NavigationEnd } from "@angular/router";
import { map, filter, take, exhaustMap, tap } from "rxjs/operators";
import { combineLatest } from "rxjs";
import { AuthService } from "./api/auth/auth.service";
import { OrganizationsService } from "./api/organizations/organizations.service";
import { SettingsService } from "./api/settings.service";
import { UserService } from "./api/user/user.service";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  title = "glitchtip-frontend";
  isLoggedIn$ = this.auth.isLoggedIn;

  /**
   * Need RoutesRecognized to fire before retrieving organizations since doing
   * so relies on the organization slug to set the active org
   */
  routesAreRecognized$ = this.router.events.pipe(
    map((event) => {
      if (event instanceof RoutesRecognized) {
        return true;
      }
      return false;
    }),
    filter((isRecognized) => !!isRecognized),
    take(1)
  );

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private organizationService: OrganizationsService,
    private settings: SettingsService,
    private router: Router,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.settings.getSettings().subscribe();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // tslint:disable:no-any
        const _paq: any = (window as any)._paq;
        if (_paq) {
          const origin = location.origin;
          _paq.push(["setCustomUrl", origin + event.url]);
          _paq.push(["trackPageView"]);
        }
      }

      if (event instanceof RoutesRecognized && event.state.root.firstChild) {
        const params = event.state.root.firstChild.params;
        const orgSlug = params["org-slug"];
        if (orgSlug !== undefined) {
          this.organizationService.setActiveOrganizationFromRouteChange(
            orgSlug
          );
        }
      }

      if (event instanceof RoutesRecognized) {
        let titleTag = "GlitchTip";
        if (typeof event.state.root.firstChild!.data.title !== "undefined") {
          titleTag = event.state.root.firstChild!.data.title + " | GlitchTip";
        }
        this.titleService.setTitle(titleTag);
      }
    });

    combineLatest([this.isLoggedIn$, this.routesAreRecognized$])
      .pipe(
        filter(([isLoggedIn, _]) => !!isLoggedIn),
        exhaustMap(() => this.organizationService.retrieveOrganizations()),
        tap(() => this.userService.getUserDetails())
      )
      .subscribe();
  }
}
