import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { forkJoin } from 'rxjs';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { RoleService } from '../../../core/services/role.service';
import { ReclamationService } from '../../../core/services/reclamation.service';
import { ForumService } from '../../../core/services/forum.service';
import { RevenueService } from '../../../core/services/revenue.service';
import { ObjectifService } from '../../../core/services/objectif.service';
import { Reclamation, Role, Utilisateur } from '../../../core/models/types';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];
  private viewReady = false;
  private dataReady = false;

  loading = true;
  errorMsg = '';

  users: Utilisateur[] = [];
  roles: Role[] = [];
  reclamations: Reclamation[] = [];

  totalUsers = 0;
  reclamationsOuvertes = 0;
  sujetsForum = 0;
  volumeRevenues = 0;

  countObjectifs = 0;
  countRevenues = 0;

  recentUsers: Utilisateur[] = [];
  recentReclamations: Reclamation[] = [];

  constructor(
    private utilisateurService: UtilisateurService,
    private roleService: RoleService,
    private reclamationService: ReclamationService,
    private forumService: ForumService,
    private revenueService: RevenueService,
    private objectifService: ObjectifService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      users: this.utilisateurService.getAll(),
      roles: this.roleService.getAll(),
      reclamations: this.reclamationService.getAll(),
      posts: this.forumService.getAllPosts(),
      revenues: this.revenueService.getAll(),
      objectifs: this.objectifService.getAll(),
    }).subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.roles = res.roles || [];
        this.reclamations = res.reclamations || [];

        this.totalUsers = this.users.length;
        this.reclamationsOuvertes = this.reclamations.filter((r) => (r.statut || 'EN_ATTENTE') !== 'RESOLUE').length;
        this.sujetsForum = (res.posts || []).length;
        this.volumeRevenues = (res.revenues || []).reduce((s, r) => s + (r.amount || 0), 0);
        this.countRevenues = (res.revenues || []).length;
        this.countObjectifs = (res.objectifs || []).length;

        this.recentUsers = this.users.slice(-5).reverse();
        this.recentReclamations = this.reclamations.slice(0, 5);

        this.loading = false;
        this.dataReady = true;
        this.tryRender();
      },
      error: () => {
        this.loading = false;
        this.errorMsg = "Impossible de charger le tableau de bord. L'API Gateway est-elle démarrée ?";
      },
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryRender();
  }

  roleName(roleId?: number): string {
    return this.roles.find((r) => r.id === roleId)?.nom ?? 'Aucun';
  }
  isAdmin(roleId?: number): boolean {
    return (this.roleName(roleId) || '').toUpperCase().includes('ADMIN');
  }
  statutClass(s?: string): string {
    return s === 'RESOLUE' ? 'badge-success' : s === 'EN_TRAITEMENT' ? 'badge-warning' : 'badge-danger';
  }
  statutLabel(s?: string): string {
    return s === 'RESOLUE' ? 'Résolue' : s === 'EN_TRAITEMENT' ? 'En traitement' : 'En attente';
  }

  private tryRender(): void {
    if (this.viewReady && this.dataReady && !this.errorMsg) {
      setTimeout(() => { this.buildBar(); this.buildPie(); }, 0);
    }
  }

  private buildBar(): void {
    if (!this.barCanvas) return;
    this.charts.push(new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Utilisateurs', 'Revenues', 'Objectifs', 'Réclamations', 'Sujets'],
        datasets: [{
          label: 'Volume',
          data: [this.totalUsers, this.countRevenues, this.countObjectifs, this.reclamations.length, this.sujetsForum],
          backgroundColor: ['#1B3A57', '#3D9B8E', '#5FBEAB', '#F59E0B', '#8B5CF6'],
          borderRadius: 6, barPercentage: 0.65,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#F2F5F7' }, ticks: { font: { size: 10 }, precision: 0 } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        },
      },
    }));
  }

  private buildPie(): void {
    if (!this.pieCanvas) return;
    const attente = this.reclamations.filter((r) => (r.statut || 'EN_ATTENTE') === 'EN_ATTENTE').length;
    const traitement = this.reclamations.filter((r) => r.statut === 'EN_TRAITEMENT').length;
    const resolues = this.reclamations.filter((r) => r.statut === 'RESOLUE').length;
    const empty = attente + traitement + resolues === 0;

    this.charts.push(new Chart(this.pieCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: empty ? ['Aucune donnée'] : ['En attente', 'En traitement', 'Résolues'],
        datasets: [{
          data: empty ? [1] : [attente, traitement, resolues],
          backgroundColor: empty ? ['#E5EAEF'] : ['#EF4444', '#F59E0B', '#10B981'],
          borderWidth: 0, hoverOffset: 8,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: { legend: { position: 'bottom', labels: { padding: 14, font: { size: 11 }, usePointStyle: true, pointStyle: 'circle' } } },
      },
    }));
  }

  ngOnDestroy(): void {
    this.charts.forEach((c) => c.destroy());
  }
}
