import { Component } from '@angular/core';
import { RadarChartComponent } from './features/chart/radar-chart.component';
import { SettingsComponent } from './features/settings/settings.component';
import { CommentsComponent } from './features/comments/comments.component';
import { ProjectComponent } from './features/project/project.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TranslatePipe } from './shared/translate.pipe';
import { ThemeService } from './core/theme.service';
import { I18nService } from './core/i18n.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, TranslatePipe, ProjectComponent, CommentsComponent, RadarChartComponent, SettingsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _theme: ThemeService,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _i18n: I18nService,
  ) {}
}
