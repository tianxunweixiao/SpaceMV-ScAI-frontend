// 认证服务类，负责处理用户登录、注册和会话管理

import { settingsManager } from '../settings/settings';
import { ToastMsgType } from '../interfaces';
import { keepTrackApi } from '../keepTrackApi';

// 用户信息接口
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// 认证服务类
export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private token: string | null = null;

  // 单例模式
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // 初始化认证服务，从localStorage加载用户信息
  public init(): void {
    const savedToken = localStorage.getItem('auth-token');
    const savedUser = localStorage.getItem('user-info');

    if (savedToken && savedUser) {
      try {
        this.token = savedToken;
        // 从JSON解析出的时间是字符串，需要安全地转换为Date对象
        const parsedUser = JSON.parse(savedUser);
        
        // 确保createdAt是有效的日期字符串
        if (typeof parsedUser.createdAt === 'string') {
          parsedUser.createdAt = new Date(parsedUser.createdAt);
        }
        
        // 确保lastLogin是有效的日期字符串（如果存在）
        if (parsedUser.lastLogin && typeof parsedUser.lastLogin === 'string') {
          parsedUser.lastLogin = new Date(parsedUser.lastLogin);
        }
        
        this.currentUser = parsedUser as User;
        
      } catch (error) {
        this.logout();
      }
    }
  }

  // 获取当前登录用户
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // 检查用户是否已登录
  public isAuthenticated(): boolean {
    return !!this.currentUser && !!this.token;
  }

  // 登出方法
  public async logout(): Promise<void> {
    // const userToLogout = this.currentUser;
    try {
      // 调用用户登出接口
      if (this.token) {
        // const response = await fetch(`${settingsManager.dataSources.tianxunServer}/api/auth/logout`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${this.token}`,
        //     'Content-Type': 'application/json'
        //   },
        //   credentials: 'include',
        //   body: JSON.stringify({ userId: userToLogout?.id || '' })
        // });
        
        // // 检查响应状态
        // if (!response.ok) {
        //   throw new Error(`Logout API failed with status: ${response.status}`);
        // }
        
        // 等待响应体解析
        // const result = await response.json();
        // API调用成功后清除认证信息
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-info');

        // 重定向到登录页面
        window.location.href = '/login.html';
      }
    } catch (error) {
      console.error('退出登录失败:', error);
      keepTrackApi.getUiManager().toast('登出失败，请稍后重试', ToastMsgType.error, true);
    }
  }

  // 获取认证令牌
  public getToken(): string | null {
    return this.token;
  }

  
}

// 导出单例实例
export const authService = AuthService.getInstance();

export default authService;