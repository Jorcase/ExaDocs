<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Notificacion;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $user = $request->user();
        $userData = null;
        $activeCarreraId = null;
        $userCarreras = collect();

        if ($user) {
            $user->loadMissing('profile');
            $userData = $user->toArray();
            $userData['avatar'] = $user->profile->avatar_url ?? $user->avatar ?? null;

            $userCarreras = $user->carreras()->select('carreras.id', 'carreras.nombre', 'carreras.codigo')->get();
            if ($userCarreras->isEmpty() && $user->profile && $user->profile->carrera_principal_id) {
                $user->carreras()->syncWithoutDetaching([
                    $user->profile->carrera_principal_id => ['es_principal' => true]
                ]);
                $userCarreras = $user->carreras()->select('carreras.id', 'carreras.nombre', 'carreras.codigo')->get();
            }
            $activeCarreraId = $request->session()->get('active_carrera_id');
            if (!$activeCarreraId && $userCarreras->isNotEmpty()) {
                $principal = $user->carreras()->wherePivot('es_principal', true)->value('carreras.id');
                $activeCarreraId = $principal ?? $userCarreras->first()->id;
                $request->session()->put('active_carrera_id', (int) $activeCarreraId);
            }
        }
        $canNotifPersonal = $user && $user->can('view_notifipersonal');

        $notifItems = collect();
        $notifUnread = 0;
        if ($canNotifPersonal) {
            $notifItems = Notificacion::where('user_id', $user->id)
                ->latest()
                ->take(5)
                ->get(['id', 'titulo', 'mensaje', 'leido_en', 'created_at']);
            $notifUnread = Notificacion::where('user_id', $user->id)
                ->whereNull('leido_en')
                ->count();
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $userData,
                'permissions' => $user
                    ? $user->getAllPermissions()->pluck('name')
                    : [],
                'active_carrera_id' => $activeCarreraId ? (int) $activeCarreraId : null,
                'carreras' => $userCarreras,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'notifications' => $canNotifPersonal ? [
                'items' => $notifItems,
                'total_unread' => $notifUnread,
            ] : null,
        ];
    }
}
