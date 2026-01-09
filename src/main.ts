/**
 *!
 * /////////////////////////////////////////////////////////////////////////////
 *
 * http://spacemv.com/
 *
 * @Copyright (C) 2025 Kruczek Labs LLC
 *
 * KeepTrack is free software: you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * KeepTrack is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with
 * KeepTrack. If not, see <http://www.gnu.org/licenses/>.
 *
 * /////////////////////////////////////////////////////////////////////////////
 */

import { KeepTrack } from './keeptrack';
import { authService } from './auth/authService';

// 检查是否需要登录
function checkAuth() {
  // 获取当前路径，排除login.html和callback.html
  const currentPath = window.location.pathname;
  const isAuthPage = currentPath.includes('login.html') || currentPath.includes('callback.html');
  
  // 初始化认证服务
  authService.init();
  
  // 如果不是认证页面且用户未登录，则重定向到登录页面
  if (!isAuthPage && !authService.isAuthenticated()) {
    // 保存当前页面，以便登录后重定向回来
    localStorage.setItem('redirectUrl', window.location.href);
    window.location.href = '/login.html';
    return false;
  }
  
  // 如果是登录页面且用户已登录，则重定向到首页或保存的重定向URL
  if (isAuthPage && authService.isAuthenticated()) {
    // 检查是否有保存的重定向URL
    const redirectUrl = localStorage.getItem('redirectUrl');
    if (redirectUrl) {
      // 有保存的URL，重定向到该URL
      localStorage.removeItem('redirectUrl');
      window.location.href = redirectUrl;
    } else {
      // 没有保存的URL，重定向到首页
      window.location.href = '/';
    }
    return false;
  }
  
  // 对于已登录用户在非认证页面，不进行重定向，允许页面正常加载
  // 这确保了已登录用户在非认证页面刷新时不会跳转到首页
  
  return true;
}

// 检查认证状态
if (checkAuth()) {
  // Load the main website class
  const keepTrack = new KeepTrack(window.settingsOverride);

  keepTrack.init();

  // Expose to window for debugging
  window.keepTrack = keepTrack;

  // Initialize the website
  KeepTrack.initCss().then(() => {
    keepTrack.run();
  });
}
