import { Component, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnDestroy {
  pageTitle = 'Tableau de bord';
  pageSubtitle = '';
  private sub: Subscription;

  constructor(private router: Router) {
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.updateTitle());
    this.updateTitle();
  }

  /**
   * On lit le snapshot global du routeur (toujours initialisé), ce qui évite
   * l'erreur "Cannot read properties of undefined (reading 'data')".
   */
  private updateTitle(): void {
    let node: ActivatedRouteSnapshot | null = this.router.routerState?.snapshot?.root ?? null;
    while (node?.firstChild) {
      node = node.firstChild;
    }
    const data = node?.data ?? {};
    this.pageTitle = data['title'] ?? 'Tableau de bord';
    this.pageSubtitle = data['subtitle'] ?? '';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
